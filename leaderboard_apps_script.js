// ============================================================
// GAME ARCADE LEADERBOARD - Google Apps Script
// Deploy as Web App: Execute as "Me", Access "Anyone"
// ============================================================
//
// SETUP:
// 1. Go to https://script.google.com and create a new project
// 2. Paste this entire file into Code.gs
// 3. Click Deploy > New Deployment > Web App
// 4. Set "Execute as" = Me, "Who has access" = Anyone
// 5. Click Deploy, authorize, and copy the Web App URL
// 6. Paste the URL into shared.js LEADERBOARD_URL constant
//
// This script auto-creates a Google Sheet called "Game Arcade Leaderboard"
// ============================================================

const SHEET_NAME = 'Game Arcade Leaderboard';
const MAX_SCORES = 50;

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActive() || SpreadsheetApp.create(SHEET_NAME);
  let sheet = ss.getSheetByName('Scores');
  if (!sheet) {
    sheet = ss.insertSheet('Scores');
    sheet.appendRow(['name', 'score', 'game', 'difficulty', 'date']);
  }
  return sheet;
}

function getScores() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const scores = [];
  for (let i = 1; i < data.length; i++) {
    scores.push({
      name: data[i][0],
      score: Number(data[i][1]),
      game: data[i][2],
      difficulty: data[i][3] || '',
      date: data[i][4] || ''
    });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, MAX_SCORES);
}

function addScore(name, score, game, difficulty) {
  const sheet = getOrCreateSheet();
  const date = new Date().toISOString().slice(0, 10);
  sheet.appendRow([name, score, game, difficulty || '', date]);

  // Trim to MAX_SCORES
  const data = sheet.getDataRange().getValues();
  if (data.length > MAX_SCORES + 1) {
    // Sort by score descending, keep header + top MAX_SCORES
    const header = data[0];
    const rows = data.slice(1);
    rows.sort((a, b) => Number(b[1]) - Number(a[1]));
    const keep = rows.slice(0, MAX_SCORES);
    sheet.clear();
    sheet.appendRow(header);
    keep.forEach(row => sheet.appendRow(row));
  }

  return getScores();
}

function doGet(e) {
  const scores = getScores();
  return ContentService
    .createTextOutput(JSON.stringify({ scores }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { name, score, game, difficulty } = body;

    if (!name || score === undefined || !game) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Missing name, score, or game' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const scores = addScore(name, Number(score), game, difficulty || '');
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, scores }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
