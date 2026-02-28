// ============================================================
// GAME ARCADE LEADERBOARD - Google Apps Script
// Deploy as Web App: Execute as "Me", Access "Anyone"
// ============================================================
//
// SETUP:
// 1. Go to https://script.google.com and create a new project
// 2. Paste this entire file into Code.gs (replace all existing code)
// 3. Click Deploy > New Deployment > Web App
// 4. Set "Execute as" = Me, "Who has access" = Anyone
// 5. Click Deploy, authorize, and copy the Web App URL
// 6. Paste the URL into shared.js LEADERBOARD_URL constant
//
// IMPORTANT: After updating this code, you must create a NEW deployment
// (Deploy > Manage deployments > Edit > New version) for changes to take effect.
//
// This script auto-creates a Google Sheet called "Game Arcade Leaderboard"
// ============================================================

var SHEET_NAME = 'Game Arcade Leaderboard';
var MAX_SCORES = 50;

function getOrCreateSheet() {
  // Use Script Properties to store the spreadsheet ID
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  var ss;

  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch (e) {
      ssId = null; // ID is stale, recreate
    }
  }

  if (!ssId) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }

  var sheet = ss.getSheetByName('Scores');
  if (!sheet) {
    sheet = ss.insertSheet('Scores');
    sheet.appendRow(['name', 'score', 'game', 'difficulty', 'date']);
  }
  return sheet;
}

function getScores() {
  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var scores = [];
  for (var i = 1; i < data.length; i++) {
    scores.push({
      name: data[i][0],
      score: Number(data[i][1]),
      game: data[i][2],
      difficulty: data[i][3] || '',
      date: data[i][4] || ''
    });
  }
  scores.sort(function(a, b) { return b.score - a.score; });
  return scores.slice(0, MAX_SCORES);
}

function addScore(name, score, game, difficulty) {
  var sheet = getOrCreateSheet();
  var date = new Date().toISOString().slice(0, 10);
  sheet.appendRow([name, score, game, difficulty || '', date]);

  // Trim to MAX_SCORES
  var data = sheet.getDataRange().getValues();
  if (data.length > MAX_SCORES + 1) {
    var header = data[0];
    var rows = data.slice(1);
    rows.sort(function(a, b) { return Number(b[1]) - Number(a[1]); });
    var keep = rows.slice(0, MAX_SCORES);
    sheet.clear();
    sheet.appendRow(header);
    keep.forEach(function(row) { sheet.appendRow(row); });
  }

  return getScores();
}

function doGet(e) {
  // Handle both GET (fetch scores) and GET with action=submit (submit score via query params)
  var params = e ? e.parameter : {};

  if (params.action === 'submit' && params.name && params.score && params.game) {
    var scores = addScore(params.name, Number(params.score), params.game, params.difficulty || '');
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, scores: scores }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var scores = getScores();
  return ContentService
    .createTextOutput(JSON.stringify({ scores: scores }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var name = body.name;
    var score = body.score;
    var game = body.game;
    var difficulty = body.difficulty;

    if (!name || score === undefined || !game) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Missing name, score, or game' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var scores = addScore(name, Number(score), game, difficulty || '');
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, scores: scores }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
