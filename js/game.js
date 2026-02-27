// ============================================================
// SKATEBOARD JUMPS v2.0 - Retro Pixel Art Endless Runner
// Features: Shop, Race Mode, Characters, Chat, Music Options
// ============================================================

const GAME_W = 270;
const GAME_H = 480;
const LANE_X = [50, 92, 135, 178, 220];
const PLAYER_Y = 390;
const SPAWN_Y = -60;
const BASE_SPEED = 80;

// ============================================================
// SAVE DATA - Persistent game state
// ============================================================
const SaveData = {
    _d: null,
    _defaults: {
        highscore: 0, totalCoins: 0, selectedChar: 0, selectedBoard: 0,
        selectedOutfit: 0, musicTrack: 0, unlockedChars: [0], unlockedBoards: [0],
        unlockedOutfits: [0], raceWins: 0, racesPlayed: 0,
        jttHighscore: 0, jttGamesPlayed: 0, jttMusicTrack: 0
    },
    load() {
        try { this._d = JSON.parse(localStorage.getItem('sk8_save')) || {}; } catch(e) { this._d = {}; }
        for (const k in this._defaults) { if (this._d[k] === undefined) this._d[k] = JSON.parse(JSON.stringify(this._defaults[k])); }
    },
    save() { localStorage.setItem('sk8_save', JSON.stringify(this._d)); },
    get(k) { if (!this._d) this.load(); return this._d[k]; },
    set(k, v) { if (!this._d) this.load(); this._d[k] = v; this.save(); },
};
SaveData.load();

// ============================================================
// CHARACTER / BOARD / OUTFIT DATA
// ============================================================
const CHARACTERS = [
    { name: 'Jake', skin: 0xFFCC99, shirt: 0x3366CC, pants: 0x2a2a50, cap: 0xCC3333, hair: null, cost: 0 },
    { name: 'Luna', skin: 0xE8B88A, shirt: 0xCC33AA, pants: 0x332255, cap: null, hair: 0x442200, cost: 50 },
    { name: 'Blaze', skin: 0xC68642, shirt: 0xFF4400, pants: 0x222222, cap: 0x111111, hair: null, cost: 100 },
    { name: 'Frost', skin: 0xDDDDEE, shirt: 0x44AADD, pants: 0x334455, cap: 0x2288BB, hair: null, cost: 150 },
    { name: 'Shadow', skin: 0x555555, shirt: 0x222222, pants: 0x111111, cap: 0x000000, hair: null, cost: 250 },
    { name: 'Goldie', skin: 0xFFCC99, shirt: 0xFFAA00, pants: 0xCC8800, cap: 0xFFDD00, hair: null, cost: 500 },
];
const BOARDS = [
    { name: 'Classic', deck: 0x8B4513, stripe: 0xA0522D, wheels: 0x444444, cost: 0 },
    { name: 'Neon', deck: 0x00FF88, stripe: 0x00CCAA, wheels: 0x00FF00, cost: 60 },
    { name: 'Fire', deck: 0xFF3300, stripe: 0xFF6600, wheels: 0xFF0000, cost: 80 },
    { name: 'Ice', deck: 0x44CCFF, stripe: 0x88DDFF, wheels: 0x2299CC, cost: 100 },
    { name: 'Galaxy', deck: 0x6600CC, stripe: 0x9933FF, wheels: 0xCC00FF, cost: 200 },
    { name: 'Gold', deck: 0xFFAA00, stripe: 0xFFDD00, wheels: 0xFFCC00, cost: 400 },
];
const OUTFITS = [
    { name: 'Default', mod: null, cost: 0 },
    { name: 'Hoodie', mod: { shirtH: 15, hood: true }, cost: 40 },
    { name: 'Tank Top', mod: { noSleeves: true }, cost: 30 },
    { name: 'Suit', mod: { shirt: 0x222233, pants: 0x222233, tie: true }, cost: 120 },
    { name: 'Hawaiian', mod: { shirt: 0x22AA55, floral: true }, cost: 80 },
    { name: 'Ninja', mod: { shirt: 0x111111, pants: 0x111111, mask: true }, cost: 200 },
];

const MUSIC_TRACKS = [
    { name: 'Chill Ride', melody: [262,294,330,392,440,392,330,294, 330,392,440,523,440,392,330,392, 440,392,330,262,294,330,392,330, 294,262,294,330,294,262,220,262], bass: [131,131,165,165,196,196,220,220, 175,175,196,196,220,220,262,262, 220,220,196,196,165,165,131,131, 147,147,165,165,147,147,110,131], tempo: 0.18 },
    { name: 'Speed Rush', melody: [330,330,440,440,523,523,440,330, 392,523,660,523,440,392,330,392, 523,660,784,660,523,440,392,440, 330,392,440,523,440,392,330,262], bass: [165,165,220,220,262,262,220,165, 196,262,330,262,220,196,165,196, 262,330,392,330,262,220,196,220, 165,196,220,262,220,196,165,131], tempo: 0.13 },
    { name: 'Night Grind', melody: [220,262,330,262,220,175,220,262, 330,392,330,262,220,262,330,392, 440,392,330,262,220,262,330,262, 220,175,147,175,220,262,220,175], bass: [110,110,131,131,165,165,131,131, 110,110,131,131,165,165,196,196, 220,220,196,196,165,165,131,131, 110,110,88,88,110,110,131,110], tempo: 0.22 },
    { name: 'Pixel Punk', melody: [392,392,523,523,660,523,392,523, 660,784,660,523,392,330,392,523, 330,392,523,660,784,660,523,392, 523,660,523,392,330,262,330,392], bass: [196,196,262,262,330,262,196,262, 330,392,330,262,196,165,196,262, 165,196,262,330,392,330,262,196, 262,330,262,196,165,131,165,196], tempo: 0.12 },
];

// ============================================================
// AUDIO
// ============================================================
class ChipAudio {
    constructor() { this.ctx = null; this.enabled = true; this.musicGain = null; this.musicPlaying = false; this._musicTimer = null; this.currentTrack = 0; }
    init() { if (this.ctx) return; this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.12; this.musicGain.connect(this.ctx.destination); }
    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
    _beep(freq, dur, type, vol, delay) {
        if (!this.ctx || !this.enabled) return;
        const t = this.ctx.currentTime + (delay || 0);
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(vol || 0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + dur);
    }
    playJump() { this._beep(300,0.08,'square',0.15); this._beep(500,0.1,'square',0.12,0.05); }
    playLand() { this._beep(150,0.06,'triangle',0.1); }
    playCoin() { this._beep(800,0.05,'square',0.1); this._beep(1200,0.08,'square',0.1,0.05); }
    playCrash() { for(let i=0;i<5;i++) this._beep(100+Math.random()*200,0.15,'sawtooth',0.12,i*0.03); }
    playSwoosh() { this._beep(400,0.06,'sine',0.08); this._beep(600,0.04,'sine',0.06,0.03); }
    playPowerup() { [400,500,600,800].forEach((f,i)=>this._beep(f,0.1,'square',0.1,i*0.06)); }
    playGameOver() { [400,350,300,200].forEach((f,i)=>this._beep(f,0.2,'triangle',0.12,i*0.15)); }
    playClick() { this._beep(600,0.04,'square',0.08); }
    playWin() { [523,659,784,1047].forEach((f,i)=>this._beep(f,0.15,'square',0.12,i*0.1)); }
    playBounce() { this._beep(200,0.06,'sine',0.12); this._beep(400,0.08,'sine',0.1,0.04); }
    playBreak() { for(let i=0;i<4;i++) this._beep(80+Math.random()*150,0.1,'sawtooth',0.1,i*0.02); this._beep(60,0.2,'triangle',0.08,0.1); }

    startMusic(trackIdx, customTracks) {
        if (!this.ctx) return;
        this.stopMusic();
        this._customTracks = customTracks || null;
        this.currentTrack = trackIdx !== undefined ? trackIdx : SaveData.get('musicTrack');
        this.musicPlaying = true;
        this._playLoop();
    }
    _playLoop() {
        if (!this.musicPlaying || !this.ctx) return;
        const trackList = this._customTracks || MUSIC_TRACKS;
        const track = trackList[this.currentTrack] || trackList[0];
        const t0 = this.ctx.currentTime + 0.05;
        track.melody.forEach((freq, i) => {
            const t = t0 + i * track.tempo;
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'square'; o.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + track.tempo * 0.9);
            o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + track.tempo);
        });
        track.bass.forEach((freq, i) => {
            const t = t0 + i * track.tempo;
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'triangle'; o.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + track.tempo * 0.9);
            o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + track.tempo);
        });
        this._musicTimer = setTimeout(() => this._playLoop(), track.melody.length * track.tempo * 1000 - 50);
    }
    stopMusic() { this.musicPlaying = false; if (this._musicTimer) { clearTimeout(this._musicTimer); this._musicTimer = null; } }
}
const audio = new ChipAudio();

// ============================================================
// TEXTURE GENERATION
// ============================================================
function createPixelTexture(scene, key, w, h, drawFn) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ add: false }); drawFn(g, w, h); g.generateTexture(key, w, h); g.destroy();
}

function drawSkater(g, char, board, outfit) {
    const c = CHARACTERS[char] || CHARACTERS[0];
    const b = BOARDS[board] || BOARDS[0];
    const o = OUTFITS[outfit] || OUTFITS[0];
    const shirt = (o.mod && o.mod.shirt) || c.shirt;
    const pants = (o.mod && o.mod.pants) || c.pants;

    g.fillStyle(0x000000, 0.15); g.fillEllipse(12, 30, 22, 6);
    g.fillStyle(b.deck); g.fillRect(2, 26, 20, 4);
    g.fillStyle(b.stripe); g.fillRect(3, 27, 18, 2);
    g.fillStyle(b.wheels); g.fillRect(4, 30, 3, 3); g.fillRect(17, 30, 3, 3);
    g.fillStyle(pants); g.fillRect(7, 18, 4, 9); g.fillRect(13, 18, 4, 9);
    g.fillStyle(shirt); g.fillRect(6, 6, 12, 13);
    if (o.mod && o.mod.tie) { g.fillStyle(0xCC0000); g.fillRect(11, 8, 2, 10); }
    if (o.mod && o.mod.floral) { g.fillStyle(0xFFFF00); g.fillRect(8,8,2,2); g.fillRect(14,10,2,2); g.fillRect(10,14,2,2); }
    if (!(o.mod && o.mod.noSleeves)) { const armC = (o.mod && o.mod.shirt) || (c.shirt - 0x060606); g.fillStyle(shirt); g.fillRect(3, 8, 4, 8); g.fillRect(17, 8, 4, 8); }
    if (o.mod && o.mod.hood) { g.fillStyle(shirt); g.fillRect(6, 0, 12, 8); }
    g.fillStyle(c.skin); g.fillRect(8, 0, 8, 7);
    if (o.mod && o.mod.mask) { g.fillStyle(0x111111); g.fillRect(8, 2, 8, 5); g.fillStyle(c.skin); g.fillRect(9, 3, 2, 2); g.fillRect(13, 3, 2, 2); }
    if (c.cap) { g.fillStyle(c.cap); g.fillRect(7, 0, 10, 3); }
    if (c.hair) { g.fillStyle(c.hair); g.fillRect(7, 0, 10, 2); g.fillRect(6, 2, 2, 4); g.fillRect(16, 2, 2, 4); }
    g.fillStyle(0x222222); g.fillRect(9, 3, 2, 2); g.fillRect(13, 3, 2, 2);
}

function generateAllTextures(scene) {
    createPixelTexture(scene, 'road', GAME_W, 160, (g, w, h) => {
        // Motorway asphalt
        g.fillStyle(0x333340); g.fillRect(0, 0, w, h);
        // Hard shoulder (left & right)
        g.fillStyle(0x2a2a35); g.fillRect(0, 0, 28, h); g.fillRect(242, 0, 28, h);
        // Metal crash barriers
        g.fillStyle(0x667788); g.fillRect(0, 0, 4, h); g.fillRect(266, 0, 4, h);
        g.fillStyle(0x556677); g.fillRect(1, 0, 2, h); g.fillRect(267, 0, 2, h);
        // Barrier posts
        g.fillStyle(0x445566); for (let y = 0; y < h; y += 30) { g.fillRect(0, y, 4, 4); g.fillRect(266, y, 4, 4); }
        // Solid white edge lines
        g.fillStyle(0xDDDDDD); g.fillRect(27, 0, 2, h); g.fillRect(241, 0, 2, h);
        // Dashed white lane markings (4 dividers for 5 lanes)
        g.fillStyle(0xCCCCCC);
        for (let y = 0; y < h; y += 20) { g.fillRect(70, y, 2, 10); g.fillRect(113, y, 2, 10); g.fillRect(156, y, 2, 10); g.fillRect(198, y, 2, 10); }
        // Road surface texture variation
        g.fillStyle(0x383845); g.fillRect(60, 0, 1, h); g.fillRect(135, 0, 1, h); g.fillRect(210, 0, 1, h);
        // Reflective cat's eyes between lanes (4 sets)
        g.fillStyle(0xFFFF44); for (let y = 4; y < h; y += 20) { g.fillRect(71, y, 1, 2); g.fillRect(114, y, 1, 2); g.fillRect(157, y, 1, 2); g.fillRect(199, y, 1, 2); }
        // Red cat's eyes on edge
        g.fillStyle(0xFF4444); for (let y = 4; y < h; y += 20) { g.fillRect(28, y, 1, 2); g.fillRect(242, y, 1, 2); }
    });
    createPixelTexture(scene, 'shadow', 20, 8, (g) => { g.fillStyle(0x000000, 0.3); g.fillEllipse(10, 4, 20, 8); });
    createPixelTexture(scene, 'cone', 14, 20, (g) => {
        g.fillStyle(0xFF6600); g.fillRect(5,0,4,4); g.fillRect(3,4,8,6); g.fillRect(1,10,12,6);
        g.fillStyle(0xFFFFFF); g.fillRect(3,6,8,2); g.fillRect(1,12,12,2);
        g.fillStyle(0xCCCCCC); g.fillRect(0,16,14,4);
    });
    createPixelTexture(scene, 'trash_can', 18, 24, (g) => {
        g.fillStyle(0x666670); g.fillRect(2,4,14,18); g.fillStyle(0x777780); g.fillRect(1,2,16,4);
        g.fillStyle(0x888890); g.fillRect(0,0,18,3); g.fillStyle(0x555560); g.fillRect(2,22,14,2);
        g.fillStyle(0x999999); g.fillRect(7,0,4,1); g.fillStyle(0x8888a0); g.fillRect(3,6,2,14);
    });
    createPixelTexture(scene, 'pothole', 24, 12, (g) => { g.fillStyle(0x1a1a22); g.fillEllipse(12,6,24,12); g.fillStyle(0x222230); g.fillEllipse(12,5,20,9); });
    createPixelTexture(scene, 'coin', 12, 12, (g) => { g.fillStyle(0xFFD700); g.fillEllipse(6,6,12,12); g.fillStyle(0xFFE44D); g.fillEllipse(5,5,8,8); g.fillStyle(0xCC9900); g.fillRect(5,4,2,4); });
    const puC = { shield:0x4499FF, magnet:0xFF4444, speed_boost:0xFFFF44, slow_motion:0xAA44FF };
    Object.entries(puC).forEach(([k,c]) => createPixelTexture(scene,'pu_'+k,16,16,(g)=>{ g.fillStyle(c,0.3); g.fillEllipse(8,8,16,16); g.fillStyle(c); g.fillEllipse(8,8,12,12); g.fillStyle(0xFFFFFF,0.5); g.fillEllipse(6,6,5,5); }));
    createPixelTexture(scene, 'bg_sky', GAME_W, GAME_H, (g) => { for(let y=0;y<GAME_H;y++){const t=y/GAME_H; g.fillStyle(Phaser.Display.Color.GetColor(Math.floor(20+t*15),Math.floor(20+t*25),Math.floor(50+t*30))); g.fillRect(0,y,GAME_W,1);} });
    createPixelTexture(scene, 'bg_buildings', GAME_W, 120, (g) => {
        const bw=[30,20,25,35,22,28,18,32,24,20,30,26]; let x=0;
        bw.forEach(w=>{const h=40+Math.floor(Math.random()*60); g.fillStyle(0x222235+Math.floor(Math.random()*0x101010)); g.fillRect(x,120-h,w-1,h);
        for(let wy=120-h+5;wy<115;wy+=10) for(let wx=x+3;wx<x+w-4;wx+=7) if(Math.random()>0.3){g.fillStyle(Math.random()>0.5?0x667799:0x445566); g.fillRect(wx,wy,3,4);} x+=w;});
    });
    // Roadside buildings - various types
    // Small shop (left side)
    createPixelTexture(scene, 'bld_shop', 28, 40, (g) => {
        g.fillStyle(0x553322); g.fillRect(0, 8, 28, 32); // walls
        g.fillStyle(0x664433); g.fillRect(1, 9, 26, 30);
        g.fillStyle(0x443322); g.fillRect(0, 0, 28, 10); // roof
        g.fillStyle(0x332211); g.fillRect(2, 1, 24, 8);
        g.fillStyle(0x88CCFF); g.fillRect(4, 18, 9, 10); // window
        g.fillStyle(0x66AADD); g.fillRect(5, 19, 7, 8);
        g.fillStyle(0x554422); g.fillRect(16, 20, 8, 20); // door
        g.fillStyle(0x665533); g.fillRect(17, 21, 6, 18);
        g.fillStyle(0xFFDD44); g.fillRect(3, 12, 22, 3); // sign
    });
    // Tall building
    createPixelTexture(scene, 'bld_tall', 26, 70, (g) => {
        g.fillStyle(0x334455); g.fillRect(0, 0, 26, 70);
        g.fillStyle(0x3a4a5a); g.fillRect(1, 1, 24, 68);
        // windows grid
        for (let wy = 4; wy < 65; wy += 10) {
            for (let wx = 3; wx < 22; wx += 8) {
                const lit = Math.random() > 0.3;
                g.fillStyle(lit ? 0xFFDD88 : 0x223344);
                g.fillRect(wx, wy, 5, 6);
            }
        }
        g.fillStyle(0x2a3a4a); g.fillRect(0, 0, 26, 3); // roof edge
    });
    // House
    createPixelTexture(scene, 'bld_house', 28, 36, (g) => {
        g.fillStyle(0x886644); g.fillRect(0, 12, 28, 24); // walls
        g.fillStyle(0x997755); g.fillRect(1, 13, 26, 22);
        // roof triangle
        g.fillStyle(0xCC4444);
        for (let i = 0; i < 12; i++) { g.fillRect(14 - i, i, i * 2, 2); }
        g.fillStyle(0x88CCFF); g.fillRect(4, 20, 7, 7); // window
        g.fillStyle(0x88CCFF); g.fillRect(17, 20, 7, 7); // window
        g.fillStyle(0x554422); g.fillRect(10, 24, 7, 12); // door
    });
    // Apartment block
    createPixelTexture(scene, 'bld_apt', 30, 55, (g) => {
        g.fillStyle(0x556666); g.fillRect(0, 0, 30, 55);
        g.fillStyle(0x5a7070); g.fillRect(1, 1, 28, 53);
        for (let wy = 4; wy < 50; wy += 8) {
            for (let wx = 3; wx < 26; wx += 7) {
                const lit = Math.random() > 0.4;
                g.fillStyle(lit ? 0xFFEE99 : 0x334444);
                g.fillRect(wx, wy, 4, 5);
            }
        }
        g.fillStyle(0x445555); g.fillRect(11, 42, 8, 13); // entrance
        g.fillStyle(0x667777); g.fillRect(12, 43, 6, 11);
    });
    // Small tree
    createPixelTexture(scene, 'bld_tree', 14, 24, (g) => {
        g.fillStyle(0x553311); g.fillRect(5, 14, 4, 10); // trunk
        g.fillStyle(0x227733); g.fillEllipse(7, 8, 14, 16); // leaves
        g.fillStyle(0x33AA44); g.fillEllipse(6, 7, 10, 12);
    });
    // Lamp post
    createPixelTexture(scene, 'bld_lamp', 8, 30, (g) => {
        g.fillStyle(0x555555); g.fillRect(3, 6, 2, 24); // pole
        g.fillStyle(0x666666); g.fillRect(1, 0, 6, 6); // top
        g.fillStyle(0xFFFF88); g.fillRect(2, 2, 4, 3); // light
        g.fillStyle(0x444444); g.fillRect(1, 28, 6, 2); // base
    });

    // Grass patch
    createPixelTexture(scene, 'bld_grass', 28, 14, (g) => {
        g.fillStyle(0x2a5a20); g.fillRect(0, 4, 28, 10);
        g.fillStyle(0x3a7a30); g.fillRect(2, 2, 24, 10);
        g.fillStyle(0x44882a); g.fillRect(3, 6, 5, 3); g.fillRect(12, 4, 6, 3); g.fillRect(21, 7, 5, 3);
        // Blades
        g.fillStyle(0x55AA44); g.fillRect(5,0,2,5); g.fillRect(10,1,2,4); g.fillRect(16,0,2,5); g.fillRect(22,2,2,3); g.fillRect(1,3,1,3);
    });
    // Grass strip (longer)
    createPixelTexture(scene, 'bld_grasslong', 30, 20, (g) => {
        g.fillStyle(0x2a5a20); g.fillRect(0, 6, 30, 14);
        g.fillStyle(0x337728); g.fillRect(1, 4, 28, 14);
        g.fillStyle(0x44882a); g.fillRect(3, 8, 7, 4); g.fillRect(14, 6, 8, 4); g.fillRect(22, 10, 6, 4);
        // Blades and flowers
        g.fillStyle(0x55AA44); g.fillRect(4,0,2,6); g.fillRect(9,2,2,5); g.fillRect(15,0,2,6); g.fillRect(21,1,2,5); g.fillRect(26,3,2,4);
        g.fillStyle(0x66CC55); g.fillRect(7,1,1,3); g.fillRect(18,2,1,3); g.fillRect(24,0,1,4);
        // Tiny flowers
        g.fillStyle(0xFFFF55); g.fillRect(6,2,2,2);
        g.fillStyle(0xFF6688); g.fillRect(19,1,2,2);
        g.fillStyle(0xFFFFFF); g.fillRect(12,3,2,2);
    });
    // Bush
    createPixelTexture(scene, 'bld_bush', 18, 14, (g) => {
        g.fillStyle(0x225518); g.fillEllipse(9, 8, 18, 12);
        g.fillStyle(0x337722); g.fillEllipse(9, 7, 14, 10);
        g.fillStyle(0x44AA33); g.fillEllipse(7, 6, 8, 6);
        g.fillStyle(0x44AA33); g.fillEllipse(12, 6, 8, 6);
    });

    // Generate all character textures
    for (let ci = 0; ci < CHARACTERS.length; ci++) {
        for (let bi = 0; bi < BOARDS.length; bi++) {
            for (let oi = 0; oi < OUTFITS.length; oi++) {
                createPixelTexture(scene, `skater_${ci}_${bi}_${oi}`, 24, 34, (g) => drawSkater(g, ci, bi, oi));
            }
        }
    }
    // AI racer colors
    const aiColors = [0xFF4444, 0x44FF44, 0x4444FF, 0xFFFF44, 0xFF44FF, 0xFF8800, 0x00FFFF, 0xAAFF44, 0xCC44CC, 0xFFAAAA, 0x44AAFF, 0xFFCC44, 0x88FF88, 0xAA66FF, 0xFF6688];
    aiColors.forEach((c, i) => createPixelTexture(scene, 'ai_racer_'+i, 24, 34, (g) => {
        g.fillStyle(0x000000,0.15); g.fillEllipse(12,30,22,6);
        g.fillStyle(0x664422); g.fillRect(2,26,20,4); g.fillStyle(0x553311); g.fillRect(3,27,18,2);
        g.fillStyle(0x333333); g.fillRect(4,30,3,3); g.fillRect(17,30,3,3);
        g.fillStyle(0x333344); g.fillRect(7,18,4,9); g.fillRect(13,18,4,9);
        g.fillStyle(c); g.fillRect(6,6,12,13); g.fillRect(3,8,4,8); g.fillRect(17,8,4,8);
        g.fillStyle(0xDDBB99); g.fillRect(8,0,8,7);
        g.fillStyle(0x222222); g.fillRect(9,3,2,2); g.fillRect(13,3,2,2);
    }));
}

function getSkaterKey() { return `skater_${SaveData.get('selectedChar')}_${SaveData.get('selectedBoard')}_${SaveData.get('selectedOutfit')}`; }

// ============================================================
// UI HELPERS
// ============================================================
function makeBtn(scene, x, y, text, color, cb) {
    const btn = scene.add.text(x, y, text, { fontSize:'11px', fontFamily:'monospace', color:'#fff', backgroundColor:color||'#3366CC', padding:{x:14,y:6}, align:'center' }).setOrigin(0.5).setInteractive();
    btn.on('pointerdown', () => { audio.playClick(); cb(); });
    btn.on('pointerover', () => btn.setAlpha(0.8));
    btn.on('pointerout', () => btn.setAlpha(1));
    return btn;
}
function makeTitle(scene, text) { return scene.add.text(GAME_W/2, 30, text, { fontSize:'14px', fontFamily:'monospace', color:'#FFD700', stroke:'#000', strokeThickness:2 }).setOrigin(0.5); }
function coinDisplay(scene, y) {
    return scene.add.text(GAME_W/2, y, 'Coins: $'+SaveData.get('totalCoins'), { fontSize:'10px', fontFamily:'monospace', color:'#FFD700' }).setOrigin(0.5);
}

// ============================================================
// BOOT
// ============================================================
class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() { generateAllTextures(this); this.scene.start('Launcher'); }
}

// ============================================================
// MAIN MENU - Updated with all new buttons
// ============================================================
class MainMenuScene extends Phaser.Scene {
    constructor() { super('MainMenu'); }
    create() {
        audio.init();
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.image(GAME_W/2, GAME_H/2, 'bg_sky');
        this.add.text(GAME_W/2, 55, 'SKATEBOARD\nJUMPS', { fontSize:'18px', fontFamily:'monospace', color:'#FFD700', align:'center', stroke:'#000', strokeThickness:3, lineSpacing:4 }).setOrigin(0.5);
        this.add.image(GAME_W/2, 130, getSkaterKey()).setScale(2.5);

        const bx = GAME_W / 2;
        let by = 185;
        const gap = 33;
        makeBtn(this, bx, by, '    PLAY    ', '#3366CC', () => this.scene.start('Game'));
        makeBtn(this, bx, by+=gap, '    RACE    ', '#CC6633', () => this.scene.start('Race'));
        makeBtn(this, bx, by+=gap, ' CHARACTERS ', '#336644', () => this.scene.start('CharSelect'));
        makeBtn(this, bx, by+=gap, '    SHOP    ', '#886622', () => this.scene.start('Shop'));
        makeBtn(this, bx, by+=gap, '    CHAT    ', '#664488', () => this.scene.start('Chat'));
        makeBtn(this, bx, by+=gap, 'INSTRUCTIONS', '#555566', () => this.scene.start('Instructions'));
        makeBtn(this, bx, by+=gap, '  SETTINGS  ', '#555566', () => this.scene.start('Settings'));
        makeBtn(this, bx, by+=gap, 'HIGH SCORES ', '#555566', () => this.scene.start('HighScores'));
        makeBtn(this, bx, by+=gap, 'BACK TO ARCADE', '#664444', () => { audio.stopMusic(); this.scene.start('Launcher'); });

        this.add.text(GAME_W/2, 465, 'BEST: '+(SaveData.get('highscore'))+'m  |  $'+SaveData.get('totalCoins'), { fontSize:'8px', fontFamily:'monospace', color:'#888' }).setOrigin(0.5);
    }
}

// ============================================================
// INSTRUCTIONS
// ============================================================
class InstructionsScene extends Phaser.Scene {
    constructor() { super('Instructions'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'HOW TO PLAY');
        const lines = [
            { t: 'CONTROLS', c: '#FFD700', y: 70 },
            { t: 'Swipe LEFT / RIGHT\nto switch lanes', c: '#ccc', y: 95 },
            { t: 'TAP or Swipe UP\nto JUMP over obstacles', c: '#ccc', y: 135 },
            { t: 'GOAL', c: '#FFD700', y: 180 },
            { t: 'Skate as far as you can!\nAvoid obstacles on the road.\nCollect coins for the shop.', c: '#ccc', y: 210 },
            { t: 'POWER-UPS', c: '#FFD700', y: 270 },
            { t: 'SHIELD (blue) - invincible\nMAGNET (red) - attract coins\nSPEED (yellow) - go fast!\nSLOW-MO (purple) - slow time', c: '#aaa', y: 305 },
            { t: 'RACE MODE', c: '#FFD700', y: 370 },
            { t: 'Race against 10 AI skaters!\nLast one standing wins.', c: '#ccc', y: 395 },
        ];
        lines.forEach(l => this.add.text(GAME_W/2, l.y, l.t, { fontSize:'9px', fontFamily:'monospace', color:l.c, align:'center', lineSpacing:3 }).setOrigin(0.5));
        makeBtn(this, GAME_W/2, 448, '  BACK  ', '#555566', () => this.scene.start('MainMenu'));
    }
}

// ============================================================
// CHARACTER SELECT
// ============================================================
class CharSelectScene extends Phaser.Scene {
    constructor() { super('CharSelect'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'CHARACTERS');
        coinDisplay(this, 50);

        const unlocked = SaveData.get('unlockedChars');
        const selected = SaveData.get('selectedChar');
        this.previewImg = this.add.image(GAME_W/2, 100, getSkaterKey()).setScale(3);
        this.nameLabel = this.add.text(GAME_W/2, 135, CHARACTERS[selected].name, { fontSize:'10px', fontFamily:'monospace', color:'#fff' }).setOrigin(0.5);

        const startY = 165;
        CHARACTERS.forEach((ch, i) => {
            const y = startY + i * 38;
            const owned = unlocked.includes(i);
            const isSel = i === selected;
            const key = `skater_${i}_${SaveData.get('selectedBoard')}_${SaveData.get('selectedOutfit')}`;
            this.add.image(30, y, key).setScale(1.2);
            this.add.text(55, y - 8, ch.name, { fontSize:'9px', fontFamily:'monospace', color: isSel ? '#FFD700' : '#fff' });

            if (!owned) {
                makeBtn(this, 210, y, '$'+ch.cost, '#886622', () => {
                    if (SaveData.get('totalCoins') >= ch.cost) {
                        SaveData.set('totalCoins', SaveData.get('totalCoins') - ch.cost);
                        const u = SaveData.get('unlockedChars'); u.push(i); SaveData.set('unlockedChars', u);
                        this.scene.restart();
                    }
                });
            } else if (!isSel) {
                makeBtn(this, 210, y, 'SELECT', '#336644', () => { SaveData.set('selectedChar', i); this.scene.restart(); });
            } else {
                this.add.text(210, y, 'EQUIPPED', { fontSize:'9px', fontFamily:'monospace', color:'#44FF44' }).setOrigin(0.5);
            }
        });
        makeBtn(this, GAME_W/2, 450, '  BACK  ', '#555566', () => this.scene.start('MainMenu'));
    }
}

// ============================================================
// SHOP - Boards & Outfits
// ============================================================
class ShopScene extends Phaser.Scene {
    constructor() { super('Shop'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'SHOP');
        this.coinLabel = coinDisplay(this, 50);
        this.tab = this.tab || 'boards';

        // Tabs
        const tabBoard = makeBtn(this, 70, 70, 'BOARDS', this.tab==='boards'?'#886622':'#444', () => { this.tab='boards'; this.scene.restart(); });
        const tabOutfit = makeBtn(this, 200, 70, 'OUTFITS', this.tab==='outfits'?'#886622':'#444', () => { this.tab='outfits'; this.scene.restart(); });

        const items = this.tab === 'boards' ? BOARDS : OUTFITS;
        const unlockedKey = this.tab === 'boards' ? 'unlockedBoards' : 'unlockedOutfits';
        const selectedKey = this.tab === 'boards' ? 'selectedBoard' : 'selectedOutfit';
        const unlocked = SaveData.get(unlockedKey);
        const selected = SaveData.get(selectedKey);

        const startY = 105;
        items.forEach((item, i) => {
            const y = startY + i * 36;
            const owned = unlocked.includes(i);
            const isSel = i === selected;

            if (this.tab === 'boards') {
                const g = this.add.graphics();
                g.fillStyle(item.deck); g.fillRect(15, y - 4, 24, 5);
                g.fillStyle(item.stripe); g.fillRect(16, y - 3, 22, 3);
                g.fillStyle(item.wheels); g.fillRect(17, y + 2, 4, 3); g.fillRect(33, y + 2, 4, 3);
            }
            this.add.text(55, y - 6, item.name, { fontSize:'9px', fontFamily:'monospace', color: isSel ? '#FFD700' : '#ddd' });

            if (!owned) {
                makeBtn(this, 220, y, '$'+item.cost, '#886622', () => {
                    if (SaveData.get('totalCoins') >= item.cost) {
                        SaveData.set('totalCoins', SaveData.get('totalCoins') - item.cost);
                        const u = SaveData.get(unlockedKey); u.push(i); SaveData.set(unlockedKey, u);
                        this.scene.restart();
                    }
                });
            } else if (!isSel) {
                makeBtn(this, 220, y, 'EQUIP', '#336644', () => { SaveData.set(selectedKey, i); this.scene.restart(); });
            } else {
                this.add.text(220, y, 'EQUIPPED', { fontSize:'8px', fontFamily:'monospace', color:'#44FF44' }).setOrigin(0.5);
            }
        });

        // Preview
        this.add.image(GAME_W/2, 430, getSkaterKey()).setScale(2.5);
        makeBtn(this, GAME_W/2, 460, '  BACK  ', '#555566', () => this.scene.start('MainMenu'));
    }
}

// ============================================================
// CHAT
// ============================================================
class ChatScene extends Phaser.Scene {
    constructor() { super('Chat'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'SKATER CHAT');

        const botNames = ['Sk8rBoi', 'OllieQueen', 'GrindMaster', 'FlipKid', 'RailRider'];
        const botMsgs = [
            'Just hit 5000m! New record!', 'Anyone unlocked the Gold board?', 'Race mode is so fun!',
            'The Ninja outfit is sick', 'Tips: save coins for Galaxy board', 'Who else loves Night Grind music?',
            'Shadow character is OP lol', 'I keep crashing at 3000m haha', 'Slow motion powerup is the best',
            'Frost gang where you at?', 'Just started playing, any tips?', 'The speed boost is insane!',
            'Made it to phase 5 difficulty!', 'Hawaiian outfit + Neon board = drip', 'GG everyone!',
        ];
        const quickReplies = ['GG!', 'Nice!', 'LOL', 'Same!', 'Lets go!', 'Tips?', 'Hello!', 'Race me!'];

        // Chat messages area
        const chatBg = this.add.rectangle(GAME_W/2, 230, 250, 300, 0x111122, 0.8).setStrokeStyle(1, 0x333355);
        this.chatTexts = [];

        // Generate random chat history
        const msgs = [];
        for (let i = 0; i < 8; i++) {
            const name = botNames[Math.floor(Math.random() * botNames.length)];
            const msg = botMsgs[Math.floor(Math.random() * botMsgs.length)];
            msgs.push({ name, msg, isPlayer: false });
        }
        this.allMsgs = msgs;
        this._renderChat();

        // Type your own message button
        makeBtn(this, GAME_W/2, 393, '  TYPE MESSAGE  ', '#336644', () => {
            const msg = prompt('Type your message:');
            if (msg && msg.trim()) {
                const cleaned = msg.trim().substring(0, 60);
                this.allMsgs.push({ name: 'You', msg: cleaned, isPlayer: true });
                this._renderChat();
                // Bot replies to your message
                this.time.delayedCall(800 + Math.random() * 1500, () => {
                    const rName = botNames[Math.floor(Math.random() * botNames.length)];
                    const smartReplies = [
                        'Thats cool!', 'I agree!', 'Haha nice one!', 'No way!', 'For real?',
                        'Same here lol', 'Lets gooo!', 'Yo thats sick!', 'GG!', '100% bro',
                        'Tell me more!', 'Lmaooo', 'Facts!', 'W take!', 'Bet!',
                    ];
                    this.allMsgs.push({ name: rName, msg: smartReplies[Math.floor(Math.random() * smartReplies.length)], isPlayer: false });
                    this._renderChat();
                    // Sometimes a second bot chimes in
                    if (Math.random() > 0.5) {
                        this.time.delayedCall(1000 + Math.random() * 2000, () => {
                            const rName2 = botNames[Math.floor(Math.random() * botNames.length)];
                            const followUps = ['^^^ what they said', 'Lol true', 'Ayy!', 'Yo!', 'Fr fr', 'W', 'Nah chill 😂'];
                            this.allMsgs.push({ name: rName2, msg: followUps[Math.floor(Math.random() * followUps.length)], isPlayer: false });
                            this._renderChat();
                        });
                    }
                });
            }
        });

        // Quick reply buttons
        const replyY = 418;
        this.add.text(GAME_W/2, replyY - 10, 'Quick Reply:', { fontSize:'7px', fontFamily:'monospace', color:'#666' }).setOrigin(0.5);
        for (let i = 0; i < quickReplies.length; i++) {
            const col = Math.floor(i / 2);
            const row = i % 2;
            const bx = 45 + col * 60;
            const by = replyY + 6 + row * 20;
            makeBtn(this, bx, by, quickReplies[i], '#334466', () => {
                this.allMsgs.push({ name: 'You', msg: quickReplies[i], isPlayer: true });
                this.time.delayedCall(500 + Math.random() * 1000, () => {
                    const rName = botNames[Math.floor(Math.random() * botNames.length)];
                    const responses = ['Haha nice!', 'For real!', 'Same here!', 'Lets gooo!', 'GG!', '100%!', 'Yo!', 'Ayy!'];
                    this.allMsgs.push({ name: rName, msg: responses[Math.floor(Math.random() * responses.length)], isPlayer: false });
                    this._renderChat();
                });
                this._renderChat();
            });
        }
        makeBtn(this, GAME_W/2, 466, '  BACK  ', '#555566', () => this.scene.start('MainMenu'));
    }
    _renderChat() {
        this.chatTexts.forEach(t => t.destroy());
        this.chatTexts = [];
        const visible = this.allMsgs.slice(-8);
        visible.forEach((m, i) => {
            const y = 95 + i * 34;
            const nameColor = m.isPlayer ? '#44FF44' : '#FFD700';
            const t1 = this.add.text(20, y, m.name + ':', { fontSize:'8px', fontFamily:'monospace', color: nameColor });
            const t2 = this.add.text(20, y + 12, m.msg, { fontSize:'8px', fontFamily:'monospace', color:'#ccc', wordWrap:{width:230} });
            this.chatTexts.push(t1, t2);
        });
    }
}

// ============================================================
// SETTINGS - with music options
// ============================================================
class SettingsScene extends Phaser.Scene {
    constructor() { super('Settings'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'SETTINGS');

        // Sound toggle
        const soundBtn = this.add.text(GAME_W/2, 80, 'SOUND: '+(audio.enabled?'ON':'OFF'), {
            fontSize:'11px', fontFamily:'monospace', color:'#fff',
            backgroundColor: audio.enabled?'#336633':'#663333', padding:{x:16,y:6}
        }).setOrigin(0.5).setInteractive();
        soundBtn.on('pointerdown', () => {
            audio.enabled = !audio.enabled; audio.playClick();
            soundBtn.setText('SOUND: '+(audio.enabled?'ON':'OFF'));
            soundBtn.setBackgroundColor(audio.enabled?'#336633':'#663333');
        });

        // Music track selection
        this.add.text(GAME_W/2, 120, 'MUSIC TRACK:', { fontSize:'10px', fontFamily:'monospace', color:'#FFD700' }).setOrigin(0.5);
        const currentTrack = SaveData.get('musicTrack');
        MUSIC_TRACKS.forEach((track, i) => {
            const y = 148 + i * 32;
            const isSel = i === currentTrack;
            const bg = isSel ? '#336644' : '#333344';
            const btn = this.add.text(GAME_W/2, y, (isSel ? '> ' : '  ') + track.name + (isSel ? ' <' : ''), {
                fontSize:'10px', fontFamily:'monospace', color: isSel ? '#44FF44' : '#aaa',
                backgroundColor: bg, padding: { x: 20, y: 5 }
            }).setOrigin(0.5).setInteractive();
            btn.on('pointerdown', () => {
                SaveData.set('musicTrack', i);
                audio.stopMusic(); audio.startMusic(i);
                audio.playClick();
                this.scene.restart();
            });
        });

        // Preview music button
        makeBtn(this, GAME_W/2, 290, 'PREVIEW MUSIC', '#554488', () => {
            audio.init(); audio.resume();
            audio.startMusic(SaveData.get('musicTrack'));
        });
        makeBtn(this, GAME_W/2, 318, 'STOP MUSIC', '#443355', () => audio.stopMusic());

        // Controls info
        this.add.text(GAME_W/2, 360, 'CONTROLS:', { fontSize:'10px', fontFamily:'monospace', color:'#FFD700' }).setOrigin(0.5);
        this.add.text(GAME_W/2, 385, 'Swipe L/R = change lane\nTap/Swipe Up = jump\nESC = pause', {
            fontSize:'8px', fontFamily:'monospace', color:'#aaa', align:'center', lineSpacing:3
        }).setOrigin(0.5);

        makeBtn(this, GAME_W/2, 440, '  BACK  ', '#555566', () => { audio.stopMusic(); this.scene.start('MainMenu'); });
    }
}

// ============================================================
// HIGH SCORES
// ============================================================
class HighScoresScene extends Phaser.Scene {
    constructor() { super('HighScores'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'HIGH SCORES');
        const stats = [
            { label: 'Best Distance', value: SaveData.get('highscore') + 'm', color: '#fff' },
            { label: 'Total Coins', value: '$' + SaveData.get('totalCoins'), color: '#FFD700' },
            { label: 'Races Played', value: '' + SaveData.get('racesPlayed'), color: '#ccc' },
            { label: 'Race Wins', value: '' + SaveData.get('raceWins'), color: '#44FF44' },
        ];
        stats.forEach((s, i) => {
            const y = 80 + i * 55;
            this.add.text(GAME_W/2, y, s.label, { fontSize:'10px', fontFamily:'monospace', color:'#888' }).setOrigin(0.5);
            this.add.text(GAME_W/2, y + 20, s.value, { fontSize:'16px', fontFamily:'monospace', color:s.color }).setOrigin(0.5);
        });
        // Unlocked items count
        this.add.text(GAME_W/2, 310, 'Unlocked', { fontSize:'10px', fontFamily:'monospace', color:'#888' }).setOrigin(0.5);
        const uChars = SaveData.get('unlockedChars').length + '/' + CHARACTERS.length + ' chars';
        const uBoards = SaveData.get('unlockedBoards').length + '/' + BOARDS.length + ' boards';
        const uOutfits = SaveData.get('unlockedOutfits').length + '/' + OUTFITS.length + ' outfits';
        this.add.text(GAME_W/2, 335, uChars + '  ' + uBoards + '\n' + uOutfits, {
            fontSize:'9px', fontFamily:'monospace', color:'#aaa', align:'center', lineSpacing:3
        }).setOrigin(0.5);
        makeBtn(this, GAME_W/2, 420, '  BACK  ', '#555566', () => this.scene.start('MainMenu'));
    }
}

// ============================================================
// MAIN GAME SCENE
// ============================================================
class GameScene extends Phaser.Scene {
    constructor() { super('Game'); }
    create() {
        audio.init(); audio.resume();
        this.gameState = 'playing';
        this.distance = 0; this.coins = 0; this.currentLane = 2;
        this.isJumping = false; this.isCrashed = false;
        this.speed = BASE_SPEED; this.baseSpeed = BASE_SPEED;
        this.activePowerup = null; this.powerupTimer = 0;
        this.invincible = false; this.magnetActive = false;
        this.spawnTimer = 0; this.spawnInterval = 2.0; this.difficultyPhase = 0;
        this.safeCooldown = 0; this.safeActive = false; this.safeTimer = 0;

        this.add.image(GAME_W/2, GAME_H/2, 'bg_sky').setScrollFactor(0);
        this.bgB1 = this.add.tileSprite(GAME_W/2, 60, GAME_W, 120, 'bg_buildings').setScrollFactor(0);
        this.bgB2 = this.add.tileSprite(GAME_W/2, 60, GAME_W, 120, 'bg_buildings').setScrollFactor(0).setAlpha(0.5).setTint(0x8888aa);
        this.roadTiles = [];
        for (let i = 0; i < 5; i++) this.roadTiles.push(this.add.image(GAME_W/2, i*160-160, 'road').setOrigin(0.5, 0));

        // Roadside buildings
        this.buildings = this.add.group();
        this.bldTypes = ['bld_shop','bld_tall','bld_house','bld_apt','bld_tree','bld_lamp','bld_grass','bld_grasslong','bld_bush','bld_grass','bld_bush'];
        this.bldSpawnTimer = 0; this.bldSpawnInterval = 0.6;
        // Pre-fill buildings on screen
        for (let y = -80; y < GAME_H + 40; y += 70) { this._spawnBuilding(y); }

        this.obstacles = this.add.group(); this.coinSprites = this.add.group(); this.powerups = this.add.group();
        this.playerShadow = this.add.image(LANE_X[2], PLAYER_Y+14, 'shadow');
        this.player = this.add.image(LANE_X[2], PLAYER_Y, getSkaterKey());
        this.playerTargetX = LANE_X[2]; this.playerVisualOffsetY = 0;

        this.hud = {};
        this.hud.distance = this.add.text(8,6,'0m',{fontSize:'10px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2}).setDepth(100);
        this.hud.coins = this.add.text(GAME_W/2,6,'$0',{fontSize:'10px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:2}).setOrigin(0.5,0).setDepth(100);
        this.hud.powerup = this.add.text(GAME_W/2,GAME_H-30,'',{fontSize:'9px',fontFamily:'monospace',color:'#4499FF',stroke:'#000',strokeThickness:2}).setOrigin(0.5).setDepth(100).setVisible(false);
        this.hud.jumpBonus = this.add.text(GAME_W/2, PLAYER_Y-50, '', {fontSize:'9px',fontFamily:'monospace',color:'#44FF44',stroke:'#000',strokeThickness:2}).setOrigin(0.5).setDepth(100).setAlpha(0);

        // Pause button - large, visible, top-right corner
        const pauseBtn = this.add.text(GAME_W - 8, 6, ' || ', {
            fontSize:'14px', fontFamily:'monospace', color:'#fff',
            backgroundColor:'#00000088', padding:{x:6,y:4}, stroke:'#888', strokeThickness:1
        }).setOrigin(1, 0).setDepth(100).setInteractive();
        pauseBtn.on('pointerdown', () => { if (this.gameState === 'playing') { this.gameState = 'paused'; this._showPause(); } });

        // Safe button - bottom-left, grants temporary invincibility
        this.safeBtn = this.add.text(8, GAME_H - 8, 'SAFE', {
            fontSize:'10px', fontFamily:'monospace', color:'#fff',
            backgroundColor:'#22668888', padding:{x:8,y:5}, stroke:'#4499FF', strokeThickness:1
        }).setOrigin(0, 1).setDepth(100).setInteractive();
        this.safeCdText = this.add.text(8, GAME_H - 32, 'READY', {
            fontSize:'7px', fontFamily:'monospace', color:'#4499FF', stroke:'#000', strokeThickness:1
        }).setOrigin(0, 1).setDepth(100);
        this.safeBtn.on('pointerdown', () => { this._activateSafe(); });

        this._setupInput();
        audio.startMusic(SaveData.get('musicTrack'));
        this._initPatterns();
    }

    _setupInput() {
        this.touchStartX = 0; this.touchStartY = 0; this.touchStartTime = 0;
        this.input.on('pointerdown', (p) => { this.touchStartX=p.x; this.touchStartY=p.y; this.touchStartTime=this.time.now; });
        this.input.on('pointerup', (p) => {
            if (this.gameState !== 'playing') return;
            const dx=p.x-this.touchStartX, dy=p.y-this.touchStartY, dist=Math.sqrt(dx*dx+dy*dy);
            const elapsed=(this.time.now-this.touchStartTime)/1000;
            if (elapsed > 0.3) return;
            const s = this.scale.width / GAME_W;
            if (dist < 10*s) this.doJump();
            else if (dist >= 25*s) { if(Math.abs(dx)>Math.abs(dy)){dx<0?this.moveLeft():this.moveRight();}else if(dy<0)this.doJump(); }
        });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-A', () => this.moveLeft());
        this.input.keyboard.on('keydown-D', () => this.moveRight());
        this.input.keyboard.on('keydown-SPACE', () => this.doJump());
        this.input.keyboard.on('keydown-ESC', () => { if(this.gameState==='playing'){this.gameState='paused';this._showPause();} });
    }
    _initPatterns() {
        this.easyP = [[{lane:0,type:'cone',yOff:0}],[{lane:1,type:'trash_can',yOff:0}],[{lane:2,type:'cone',yOff:0}],[{lane:3,type:'trash_can',yOff:0}],[{lane:4,type:'cone',yOff:0}]];
        this.medP = [[{lane:0,type:'cone',yOff:0},{lane:1,type:'trash_can',yOff:0}],[{lane:2,type:'cone',yOff:0},{lane:3,type:'trash_can',yOff:0}],[{lane:1,type:'trash_can',yOff:0},{lane:4,type:'cone',yOff:0}],[{lane:0,type:'cone',yOff:0},{lane:3,type:'cone',yOff:0}]];
        this.hardP = [[{lane:0,type:'cone',yOff:0},{lane:1,type:'trash_can',yOff:0},{lane:3,type:'pothole',yOff:-40}],[{lane:1,type:'trash_can',yOff:0},{lane:2,type:'cone',yOff:-50},{lane:4,type:'trash_can',yOff:0}],[{lane:0,type:'trash_can',yOff:0},{lane:2,type:'cone',yOff:0},{lane:3,type:'trash_can',yOff:0},{lane:4,type:'pothole',yOff:-30}]];
    }

    update(time, delta) {
        if (this.gameState !== 'playing') return;
        const dt = delta / 1000;
        if(Phaser.Input.Keyboard.JustDown(this.cursors.left))this.moveLeft();
        if(Phaser.Input.Keyboard.JustDown(this.cursors.right))this.moveRight();
        if(Phaser.Input.Keyboard.JustDown(this.cursors.up))this.doJump();

        this.distance += this.speed * dt;
        this._updateDifficulty();
        const mult = [1,1.15,1.3,1.5,1.7,2][this.difficultyPhase]||1;
        this.baseSpeed = BASE_SPEED * mult;
        if (this.activePowerup !== 'speed_boost' && this.activePowerup !== 'slow_motion') this.speed = this.baseSpeed;
        if (this.activePowerup) { this.powerupTimer-=dt; this.hud.powerup.setText(this.activePowerup.toUpperCase().replace('_',' ')+' '+Math.ceil(this.powerupTimer)+'s'); if(this.powerupTimer<=0)this._deactivatePU(); }

        this.roadTiles.forEach(t=>{t.y+=this.speed*dt;if(t.y>GAME_H+160){let m=Infinity;this.roadTiles.forEach(r=>{if(r.y<m)m=r.y;});t.y=m-160;}});
        this.bgB1.tilePositionY-=this.speed*dt*0.05; this.bgB2.tilePositionY-=this.speed*dt*0.02;
        // Scroll buildings
        this.buildings.getChildren().forEach(b=>{b.y+=this.speed*dt;if(b.y>GAME_H+80)b.destroy();});
        this.bldSpawnTimer+=dt;if(this.bldSpawnTimer>=this.bldSpawnInterval){this.bldSpawnTimer=0;this._spawnBuilding(SPAWN_Y-40);this.bldSpawnInterval=0.4+Math.random()*0.5;}
        const diff=this.playerTargetX-this.player.x;
        if(Math.abs(diff)>1){this.player.x+=Math.sign(diff)*300*dt;if(Math.abs(this.playerTargetX-this.player.x)<2)this.player.x=this.playerTargetX;}
        this.player.y=PLAYER_Y+this.playerVisualOffsetY; this.playerShadow.x=this.player.x; this.playerShadow.y=PLAYER_Y+14;

        this.spawnTimer+=dt; if(this.spawnTimer>=this.spawnInterval){this.spawnTimer=0;this._spawnPattern();this.spawnInterval=Math.max(0.6,2-this.difficultyPhase*0.25);}
        if(Math.random()<0.001*dt*60) this._spawnPU();
        this.obstacles.getChildren().forEach(o=>{o.y+=this.speed*dt;if(o.y>GAME_H+60)o.destroy();});
        this.coinSprites.getChildren().forEach(c=>{if(c.getData('att')&&!this.isCrashed){const dx=this.player.x-c.x,dy=this.player.y-c.y,d=Math.sqrt(dx*dx+dy*dy);if(d>2){c.x+=dx/d*400*dt;c.y+=dy/d*400*dt;}}else c.y+=this.speed*dt;if(c.y>GAME_H+30)c.destroy();c.setScale(0.8+Math.sin(time/150+c.x)*0.2,1);});
        this.powerups.getChildren().forEach(p=>{p.y+=this.speed*dt;if(p.y>GAME_H+30)p.destroy();p.setScale(1+Math.sin(time/200)*0.15);});
        if(!this.isCrashed) this._checkCollisions();
        this.hud.distance.setText(Math.floor(this.distance)+'m'); this.hud.coins.setText('$'+this.coins);

        // Safe button cooldown
        if (this.safeActive) {
            this.safeTimer -= dt;
            this.safeCdText.setText(Math.ceil(this.safeTimer) + 's');
            this.safeBtn.setBackgroundColor('#226688');
            // Flash effect while safe
            this.player.setAlpha(0.5 + Math.sin(time / 60) * 0.5);
            if (this.safeTimer <= 0) { this.safeActive = false; this.invincible = false; this.player.clearTint(); this.player.setAlpha(1); this.safeCooldown = 15; this.safeCdText.setColor('#FF4444'); }
        } else if (this.safeCooldown > 0) {
            this.safeCooldown -= dt;
            this.safeCdText.setText(Math.ceil(this.safeCooldown) + 's');
            this.safeBtn.setAlpha(0.4);
            if (this.safeCooldown <= 0) { this.safeCooldown = 0; this.safeCdText.setText('READY'); this.safeCdText.setColor('#4499FF'); this.safeBtn.setAlpha(1); }
        }
    }

    moveLeft(){if(this.isCrashed||this.currentLane<=0)return;this.currentLane--;this.playerTargetX=LANE_X[this.currentLane];audio.playSwoosh();}
    moveRight(){if(this.isCrashed||this.currentLane>=4)return;this.currentLane++;this.playerTargetX=LANE_X[this.currentLane];audio.playSwoosh();}
    _activateSafe(){if(this.safeCooldown>0||this.safeActive||this.isCrashed||this.gameState!=='playing')return;this.safeActive=true;this.safeTimer=3;this.invincible=true;this.player.setTint(0x44FFFF);audio.playPowerup();this.cameras.main.flash(200,68,153,255,false,null,this);}

    doJump(){if(this.isJumping||this.isCrashed)return;this.isJumping=true;this.jumpedOver=false;audio.playJump();this.tweens.add({targets:this,playerVisualOffsetY:-30,duration:220,ease:'Quad.easeOut',yoyo:true,hold:160,onComplete:()=>{this.playerVisualOffsetY=0;this.isJumping=false;audio.playLand();if(this.jumpedOver){this.hud.jumpBonus.setText('+JUMP!');this.hud.jumpBonus.setAlpha(1);this.tweens.add({targets:this.hud.jumpBonus,alpha:0,y:PLAYER_Y-80,duration:600,onComplete:()=>{this.hud.jumpBonus.y=PLAYER_Y-50;}});}}});this.tweens.add({targets:this.playerShadow,scaleX:0.4,scaleY:0.4,duration:220,ease:'Quad.easeOut',yoyo:true,hold:160});}

    _updateDifficulty(){const th=[0,500,1500,3000,5000,8000];for(let i=th.length-1;i>=0;i--)if(this.distance>=th[i]){this.difficultyPhase=i;return;}}
    _getPattern(){let p=[...this.easyP];if(this.difficultyPhase>=2)p.push(...this.medP);if(this.difficultyPhase>=4)p.push(...this.hardP);return p[Math.floor(Math.random()*p.length)];}
    _spawnPattern(){const pat=this._getPattern();const bl=new Set();pat.forEach(p=>{const o=this.add.image(LANE_X[p.lane],SPAWN_Y+p.yOff,p.type);o.setData('type',p.type);this.obstacles.add(o);bl.add(p.lane);});for(let l=0;l<5;l++)if(!bl.has(l)&&Math.random()>0.5){const c=this.add.image(LANE_X[l],SPAWN_Y-10,'coin');c.setData('att',false);this.coinSprites.add(c);}}
    _spawnPU(){const ts=['shield','magnet','speed_boost','slow_motion'];const t=ts[Math.floor(Math.random()*ts.length)];const l=Math.floor(Math.random()*5);const p=this.add.image(LANE_X[l],SPAWN_Y,'pu_'+t);p.setData('puType',t);this.powerups.add(p);}
    _spawnBuilding(y){const type=this.bldTypes[Math.floor(Math.random()*this.bldTypes.length)];const side=Math.random()>0.5;const x=side?255:15;const b=this.add.image(x,y,type).setDepth(1);this.buildings.add(b);if(Math.random()>0.4){const x2=side?15:255;const type2=this.bldTypes[Math.floor(Math.random()*this.bldTypes.length)];const b2=this.add.image(x2,y+(Math.random()*20-10),type2).setDepth(1);this.buildings.add(b2);}}

    _checkCollisions(){const px=this.player.x,py=this.player.y;
        this.obstacles.getChildren().forEach(o=>{if(!o.active)return;const inRange=Math.abs(px-o.x)<8+o.width*0.4&&Math.abs(py-o.y)<12+o.height*0.4;if(inRange){if(this.isJumping){if(!o.getData('jumped')){o.setData('jumped',true);this.jumpedOver=true;this.distance+=10;this.coins++;audio.playCoin();o.setTint(0x44FF44);}}else if(this.invincible){this.tweens.add({targets:o,alpha:0,scaleX:2,scaleY:2,duration:200,onComplete:()=>o.destroy()});}else{this._doCrash();}}});
        this.coinSprites.getChildren().forEach(c=>{if(!c.active)return;if(Math.abs(px-c.x)<14&&Math.abs(py-c.y)<14){this.coins++;audio.playCoin();this.tweens.add({targets:c,scaleX:0,scaleY:0,duration:100,onComplete:()=>c.destroy()});}else if(this.magnetActive&&!c.getData('att')&&Math.sqrt((px-c.x)**2+(py-c.y)**2)<80)c.setData('att',true);});
        this.powerups.getChildren().forEach(p=>{if(!p.active)return;if(Math.abs(px-p.x)<14&&Math.abs(py-p.y)<14){this._activatePU(p.getData('puType'));audio.playPowerup();this.tweens.add({targets:p,scaleX:2,scaleY:2,alpha:0,duration:200,onComplete:()=>p.destroy()});}});
    }

    _activatePU(type){if(this.activePowerup)this._deactivatePU();this.activePowerup=type;const dur={shield:5,magnet:8,speed_boost:5,slow_motion:6};this.powerupTimer=dur[type]||5;this.hud.powerup.setVisible(true);const cols={shield:'#4499FF',magnet:'#FF4444',speed_boost:'#FFFF44',slow_motion:'#AA44FF'};this.hud.powerup.setColor(cols[type]||'#fff');
        switch(type){case'shield':this.invincible=true;this.player.setTint(0x4499FF);break;case'magnet':this.magnetActive=true;this.player.setTint(0xFF4444);break;case'speed_boost':this.speed=this.baseSpeed*1.5;this.player.setTint(0xFFFF44);break;case'slow_motion':this.speed=this.baseSpeed*0.5;this.player.setTint(0xAA44FF);break;}}
    _deactivatePU(){switch(this.activePowerup){case'shield':if(!this.safeActive)this.invincible=false;break;case'magnet':this.magnetActive=false;break;case'speed_boost':case'slow_motion':this.speed=this.baseSpeed;break;}if(!this.safeActive)this.player.clearTint();else this.player.setTint(0x44FFFF);this.activePowerup=null;this.hud.powerup.setVisible(false);}

    _doCrash(){if(this.isCrashed)return;this.isCrashed=true;this.gameState='gameover';audio.stopMusic();audio.playCrash();
        this.player.setTint(0xFF3333);this.tweens.add({targets:this.player,angle:90,alpha:0.5,y:this.player.y+10,duration:400});this.cameras.main.shake(300,0.01);
        const prev=SaveData.get('highscore');const isNew=Math.floor(this.distance)>prev;if(isNew)SaveData.set('highscore',Math.floor(this.distance));SaveData.set('totalCoins',SaveData.get('totalCoins')+this.coins);
        this.time.delayedCall(800,()=>{audio.playGameOver();this._showGameOver(isNew);});}

    _showGameOver(isNew){
        this.add.rectangle(GAME_W/2,GAME_H/2,GAME_W,GAME_H,0x000000,0.7).setDepth(200);
        const py=GAME_H/2-20;
        this.add.rectangle(GAME_W/2,py,210,230,0x222244,0.9).setDepth(201).setStrokeStyle(2,0x4444aa);
        this.add.text(GAME_W/2,py-90,'GAME OVER',{fontSize:'14px',fontFamily:'monospace',color:'#FF4444',stroke:'#000',strokeThickness:2}).setOrigin(0.5).setDepth(202);
        if(isNew)this.add.text(GAME_W/2,py-70,'NEW BEST!',{fontSize:'10px',fontFamily:'monospace',color:'#FFD700'}).setOrigin(0.5).setDepth(202);
        ['Distance: '+Math.floor(this.distance)+'m','Coins: +$'+this.coins,'Best: '+SaveData.get('highscore')+'m'].forEach((s,i)=>this.add.text(GAME_W/2,py-40+i*22,s,{fontSize:'10px',fontFamily:'monospace',color:'#ddd'}).setOrigin(0.5).setDepth(202));
        const retBtn=this.add.text(GAME_W/2,py+45,'  RETRY  ',{fontSize:'12px',fontFamily:'monospace',color:'#fff',backgroundColor:'#3366CC',padding:{x:20,y:8}}).setOrigin(0.5).setDepth(202).setInteractive();
        const menuBtn=this.add.text(GAME_W/2,py+80,'  MENU  ',{fontSize:'12px',fontFamily:'monospace',color:'#fff',backgroundColor:'#555566',padding:{x:20,y:8}}).setOrigin(0.5).setDepth(202).setInteractive();
        retBtn.on('pointerdown',()=>{audio.playClick();this.scene.restart();});
        menuBtn.on('pointerdown',()=>{audio.playClick();this.scene.start('MainMenu');});
    }
    _showPause(){
        this.pauseOverlay=this.add.rectangle(GAME_W/2,GAME_H/2,GAME_W,GAME_H,0x000000,0.6).setDepth(300);
        this.add.text(GAME_W/2,GAME_H/2-30,'PAUSED',{fontSize:'16px',fontFamily:'monospace',color:'#fff'}).setOrigin(0.5).setDepth(301);
        const resumeBtn=this.add.text(GAME_W/2,GAME_H/2+10,'RESUME',{fontSize:'12px',fontFamily:'monospace',color:'#fff',backgroundColor:'#3366CC',padding:{x:20,y:8}}).setOrigin(0.5).setDepth(301).setInteractive();
        const quitBtn=this.add.text(GAME_W/2,GAME_H/2+50,'QUIT',{fontSize:'12px',fontFamily:'monospace',color:'#fff',backgroundColor:'#663333',padding:{x:20,y:8}}).setOrigin(0.5).setDepth(301).setInteractive();
        resumeBtn.on('pointerdown',()=>{audio.playClick();this.gameState='playing';this.scene.restart();});
        quitBtn.on('pointerdown',()=>{audio.playClick();audio.stopMusic();this.scene.start('MainMenu');});
    }
}

// ============================================================
// RACE MODE
// ============================================================
class RaceScene extends Phaser.Scene {
    constructor() { super('Race'); }
    create() {
        audio.init(); audio.resume();
        this.gameState = 'playing'; this.distance = 0; this.coins = 0;
        this.currentLane = 2; this.isJumping = false; this.isCrashed = false;
        this.speed = BASE_SPEED * 1.2; this.baseSpeed = BASE_SPEED * 1.2;
        this.activePowerup = null; this.powerupTimer = 0;
        this.invincible = false; this.magnetActive = false;
        this.spawnTimer = 0; this.spawnInterval = 1.8; this.difficultyPhase = 0;
        this.playerVisualOffsetY = 0;
        this.safeCooldown = 0; this.safeActive = false; this.safeTimer = 0;

        // BG
        this.add.image(GAME_W/2, GAME_H/2, 'bg_sky');
        this.bgB1 = this.add.tileSprite(GAME_W/2,60,GAME_W,120,'bg_buildings');
        this.roadTiles = [];
        for(let i=0;i<5;i++) this.roadTiles.push(this.add.image(GAME_W/2,i*160-160,'road').setOrigin(0.5,0));

        // Roadside buildings
        this.buildings = this.add.group();
        this.bldTypes = ['bld_shop','bld_tall','bld_house','bld_apt','bld_tree','bld_lamp','bld_grass','bld_grasslong','bld_bush','bld_grass','bld_bush'];
        this.bldSpawnTimer = 0; this.bldSpawnInterval = 0.6;
        for (let y = -80; y < GAME_H + 40; y += 70) { this._spawnBuilding(y); }

        this.obstacles = this.add.group(); this.coinSprites = this.add.group(); this.powerups = this.add.group();

        // AI Racers - 15 opponents, each has different skill level
        this.aiRacers = [];
        const aiSkills = [
            { name:'Red', reaction:130, dodgeChance:0.80, jumpChance:0.75, lookAhead:130 },
            { name:'Green', reaction:110, dodgeChance:0.88, jumpChance:0.82, lookAhead:150 },
            { name:'Blue', reaction:100, dodgeChance:0.85, jumpChance:0.85, lookAhead:145 },
            { name:'Yellow', reaction:85, dodgeChance:0.93, jumpChance:0.90, lookAhead:170 },
            { name:'Pink', reaction:120, dodgeChance:0.82, jumpChance:0.78, lookAhead:135 },
            { name:'Orange', reaction:95, dodgeChance:0.90, jumpChance:0.88, lookAhead:160 },
            { name:'Cyan', reaction:90, dodgeChance:0.91, jumpChance:0.87, lookAhead:155 },
            { name:'Lime', reaction:75, dodgeChance:0.95, jumpChance:0.93, lookAhead:185 },
            { name:'Purple', reaction:105, dodgeChance:0.86, jumpChance:0.83, lookAhead:148 },
            { name:'Peach', reaction:115, dodgeChance:0.84, jumpChance:0.80, lookAhead:140 },
            { name:'Sky', reaction:98, dodgeChance:0.89, jumpChance:0.86, lookAhead:152 },
            { name:'Gold', reaction:80, dodgeChance:0.94, jumpChance:0.91, lookAhead:175 },
            { name:'Mint', reaction:112, dodgeChance:0.87, jumpChance:0.81, lookAhead:142 },
            { name:'Violet', reaction:88, dodgeChance:0.92, jumpChance:0.89, lookAhead:165 },
            { name:'Rose', reaction:108, dodgeChance:0.85, jumpChance:0.82, lookAhead:146 },
        ];
        for (let i = 0; i < 15; i++) {
            const sk = aiSkills[i];
            const startLane = i % 5;
            const startY = PLAYER_Y - 50 - i * 18;
            const ai = {
                sprite: this.add.image(LANE_X[startLane], startY, 'ai_racer_' + i),
                lane: startLane, targetX: LANE_X[startLane], alive: true,
                moveTimer: 0.3 + Math.random() * 0.8, jumpTimer: 0,
                isJumping: false, visualOffsetY: 0, name: sk.name,
                shadow: this.add.image(LANE_X[startLane], startY+14, 'shadow').setAlpha(0.3),
                reaction: sk.reaction, dodgeChance: sk.dodgeChance,
                jumpChance: sk.jumpChance, lookAhead: sk.lookAhead,
                lastDodgeTime: 0, dodgeCooldown: 0.3,
            };
            this.aiRacers.push(ai);
        }

        // Player
        this.playerShadow = this.add.image(LANE_X[2], PLAYER_Y+14, 'shadow');
        this.player = this.add.image(LANE_X[2], PLAYER_Y, getSkaterKey());
        this.playerTargetX = LANE_X[2];

        // HUD
        this.hud = {};
        this.hud.distance = this.add.text(8,6,'0m',{fontSize:'10px',fontFamily:'monospace',color:'#fff',stroke:'#000',strokeThickness:2}).setDepth(100);
        this.hud.position = this.add.text(GAME_W/2,6,'#1',{fontSize:'12px',fontFamily:'monospace',color:'#FFD700',stroke:'#000',strokeThickness:2}).setOrigin(0.5,0).setDepth(100);
        this.hud.alive = this.add.text(GAME_W/2,22,'',{fontSize:'8px',fontFamily:'monospace',color:'#aaa',stroke:'#000',strokeThickness:1}).setOrigin(0.5).setDepth(100);

        // Pause button
        const pauseBtn = this.add.text(GAME_W - 8, 6, ' || ', {
            fontSize:'14px', fontFamily:'monospace', color:'#fff',
            backgroundColor:'#00000088', padding:{x:6,y:4}, stroke:'#888', strokeThickness:1
        }).setOrigin(1, 0).setDepth(100).setInteractive();
        pauseBtn.on('pointerdown', () => { if (this.gameState === 'playing') { this.gameState = 'paused'; this._showPause(); } });

        // Safe button
        this.safeBtn = this.add.text(8, GAME_H - 8, 'SAFE', {
            fontSize:'10px', fontFamily:'monospace', color:'#fff',
            backgroundColor:'#22668888', padding:{x:8,y:5}, stroke:'#4499FF', strokeThickness:1
        }).setOrigin(0, 1).setDepth(100).setInteractive();
        this.safeCdText = this.add.text(8, GAME_H - 32, 'READY', {
            fontSize:'7px', fontFamily:'monospace', color:'#4499FF', stroke:'#000', strokeThickness:1
        }).setOrigin(0, 1).setDepth(100);
        this.safeBtn.on('pointerdown', () => { this._activateSafe(); });

        // Input
        this.touchStartX=0;this.touchStartY=0;this.touchStartTime=0;
        this.input.on('pointerdown',(p)=>{this.touchStartX=p.x;this.touchStartY=p.y;this.touchStartTime=this.time.now;});
        this.input.on('pointerup',(p)=>{if(this.gameState!=='playing')return;const dx=p.x-this.touchStartX,dy=p.y-this.touchStartY,dist=Math.sqrt(dx*dx+dy*dy),elapsed=(this.time.now-this.touchStartTime)/1000;if(elapsed>0.3)return;const s=this.scale.width/GAME_W;if(dist<10*s)this.doJump();else if(dist>=25*s){if(Math.abs(dx)>Math.abs(dy)){dx<0?this.moveLeft():this.moveRight();}else if(dy<0)this.doJump();}});
        this.cursors=this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-A',()=>this.moveLeft());
        this.input.keyboard.on('keydown-D',()=>this.moveRight());
        this.input.keyboard.on('keydown-SPACE',()=>this.doJump());
        this.input.keyboard.on('keydown-ESC', () => { if(this.gameState==='playing'){this.gameState='paused';this._showPause();} });

        audio.startMusic(SaveData.get('musicTrack'));

        this.easyP=[[{lane:0,type:'cone',yOff:0}],[{lane:1,type:'trash_can',yOff:0}],[{lane:2,type:'cone',yOff:0}],[{lane:3,type:'trash_can',yOff:0}],[{lane:4,type:'cone',yOff:0}]];
        this.medP=[[{lane:0,type:'cone',yOff:0},{lane:2,type:'trash_can',yOff:0}],[{lane:1,type:'cone',yOff:0},{lane:3,type:'trash_can',yOff:0}],[{lane:0,type:'trash_can',yOff:0},{lane:4,type:'cone',yOff:0}],[{lane:1,type:'cone',yOff:0},{lane:2,type:'trash_can',yOff:0},{lane:4,type:'cone',yOff:0}]];
    }

    update(time, delta) {
        if (this.gameState !== 'playing') return;
        const dt = delta / 1000;
        if(Phaser.Input.Keyboard.JustDown(this.cursors.left))this.moveLeft();
        if(Phaser.Input.Keyboard.JustDown(this.cursors.right))this.moveRight();
        if(Phaser.Input.Keyboard.JustDown(this.cursors.up))this.doJump();

        this.distance += this.speed * dt;
        this.difficultyPhase = Math.min(5, Math.floor(this.distance / 800));
        this.baseSpeed = BASE_SPEED * 1.2 + this.difficultyPhase * 8;
        this.speed = this.baseSpeed;

        // Scroll
        this.roadTiles.forEach(t=>{t.y+=this.speed*dt;if(t.y>GAME_H+160){let m=Infinity;this.roadTiles.forEach(r=>{if(r.y<m)m=r.y;});t.y=m-160;}});
        this.bgB1.tilePositionY -= this.speed * dt * 0.05;
        // Scroll buildings
        this.buildings.getChildren().forEach(b=>{b.y+=this.speed*dt;if(b.y>GAME_H+80)b.destroy();});
        this.bldSpawnTimer+=dt;if(this.bldSpawnTimer>=this.bldSpawnInterval){this.bldSpawnTimer=0;this._spawnBuilding(SPAWN_Y-40);this.bldSpawnInterval=0.4+Math.random()*0.5;}

        // Player movement
        const diff=this.playerTargetX-this.player.x;
        if(Math.abs(diff)>1)this.player.x+=Math.sign(diff)*300*dt;
        this.player.y = PLAYER_Y + this.playerVisualOffsetY;
        this.playerShadow.x=this.player.x; this.playerShadow.y=PLAYER_Y+14;

        // AI movement - smart obstacle avoidance
        this.aiRacers.forEach((ai, idx) => {
            if (!ai.alive) return;
            ai.moveTimer -= dt;
            ai.lastDodgeTime += dt;
            const baseY = ai.sprite.getData('baseY') || (PLAYER_Y - 80 - idx * 30);
            if (!ai.sprite.getData('baseY')) ai.sprite.setData('baseY', baseY);

            // Scan for obstacles ahead of this AI
            const myX = ai.sprite.x;
            let threatInLane = false;
            let nearestThreatDist = 999;
            let threatLanes = [false, false, false, false, false]; // which lanes have obstacles nearby
            this.obstacles.getChildren().forEach(o => {
                if (!o.active) return;
                const oy = o.y;
                const distY = baseY - oy; // positive = obstacle above (coming toward AI)
                if (distY > 0 && distY < ai.lookAhead) {
                    // Figure out which lane this obstacle is in
                    for (let l = 0; l < 5; l++) {
                        if (Math.abs(o.x - LANE_X[l]) < 20) { threatLanes[l] = true; }
                    }
                    // Is it in MY lane?
                    if (Math.abs(o.x - LANE_X[ai.lane]) < 20 && distY < nearestThreatDist) {
                        threatInLane = true;
                        nearestThreatDist = distY;
                    }
                }
            });

            // Decision: dodge or jump when obstacle is close
            if (threatInLane && ai.lastDodgeTime > ai.dodgeCooldown && ai.moveTimer <= 0) {
                // Obstacle in my lane! React based on distance
                const reactDist = ai.reaction; // closer = harder to react
                if (nearestThreatDist < reactDist) {
                    // Try to dodge to a safe lane
                    if (Math.random() < ai.dodgeChance) {
                        // Find safe lanes
                        const safeLanes = [];
                        for (let l = 0; l < 5; l++) {
                            if (!threatLanes[l]) safeLanes.push(l);
                        }
                        if (safeLanes.length > 0) {
                            // Pick closest safe lane
                            safeLanes.sort((a, b) => Math.abs(a - ai.lane) - Math.abs(b - ai.lane));
                            ai.lane = safeLanes[0];
                            ai.targetX = LANE_X[ai.lane];
                            ai.lastDodgeTime = 0;
                            ai.moveTimer = 0.2 + Math.random() * 0.3;
                        } else if (!ai.isJumping && Math.random() < ai.jumpChance) {
                            // All lanes blocked - jump!
                            ai.isJumping = true;
                            this.tweens.add({ targets: ai, visualOffsetY: -25, duration: 200, ease:'Quad.easeOut', yoyo:true, hold:140, onComplete:()=>{ai.isJumping=false;ai.visualOffsetY=0;} });
                            ai.moveTimer = 0.3;
                        }
                    } else if (!ai.isJumping && Math.random() < ai.jumpChance * 0.5) {
                        // Failed dodge check but might jump anyway
                        ai.isJumping = true;
                        this.tweens.add({ targets: ai, visualOffsetY: -25, duration: 200, ease:'Quad.easeOut', yoyo:true, hold:140, onComplete:()=>{ai.isJumping=false;ai.visualOffsetY=0;} });
                    }
                }
            }

            // Occasional random lane drift to look more natural
            if (ai.moveTimer <= 0 && !threatInLane && Math.random() < 0.15) {
                ai.moveTimer = 1.0 + Math.random() * 1.5;
                const adj = ai.lane + (Math.random() > 0.5 ? 1 : -1);
                if (adj >= 0 && adj <= 4 && !threatLanes[adj]) {
                    ai.lane = adj;
                    ai.targetX = LANE_X[ai.lane];
                }
            }

            const adiff = ai.targetX - ai.sprite.x;
            if (Math.abs(adiff) > 1) ai.sprite.x += Math.sign(adiff) * 300 * dt;
            ai.sprite.y = baseY + ai.visualOffsetY;
            ai.shadow.x = ai.sprite.x;
            ai.shadow.y = baseY + 14;
        });

        // Spawn obstacles
        this.spawnTimer+=dt;
        if(this.spawnTimer>=this.spawnInterval){
            this.spawnTimer=0;
            let pool=[...this.easyP];if(this.difficultyPhase>=2)pool.push(...this.medP);
            const pat=pool[Math.floor(Math.random()*pool.length)];
            const bl=new Set();
            pat.forEach(p=>{const o=this.add.image(LANE_X[p.lane],SPAWN_Y+p.yOff,p.type);o.setData('type',p.type);this.obstacles.add(o);bl.add(p.lane);});
            this.spawnInterval=Math.max(0.8, 1.8-this.difficultyPhase*0.15);
        }

        // Move obstacles
        this.obstacles.getChildren().forEach(o=>{
            o.y+=this.speed*dt;
            // Check AI collision
            this.aiRacers.forEach(ai => {
                if (!ai.alive || ai.isJumping) return;
                if (Math.abs(ai.sprite.x - o.x) < 15 && Math.abs(ai.sprite.y - o.y) < 18) {
                    ai.alive = false;
                    ai.sprite.setTint(0xFF3333);
                    this.tweens.add({ targets: ai.sprite, alpha: 0.3, angle: 90, duration: 400 });
                    ai.shadow.setAlpha(0);
                }
            });
            if(o.y>GAME_H+60)o.destroy();
        });

        // Check player collision
        if (!this.isCrashed && !this.isJumping) {
            this.obstacles.getChildren().forEach(o=>{
                if(!o.active)return;
                if(Math.abs(this.player.x-o.x)<8+o.width*0.4&&Math.abs(this.player.y-o.y)<12+o.height*0.4){
                    if(this.safeActive){this.tweens.add({targets:o,alpha:0,scaleX:2,scaleY:2,duration:200,onComplete:()=>o.destroy()});}
                    else{this._doCrash();}
                }
            });
        }

        // Safe button cooldown
        if (this.safeActive) {
            this.safeTimer -= dt;
            this.safeCdText.setText(Math.ceil(this.safeTimer) + 's');
            this.safeBtn.setBackgroundColor('#226688');
            this.player.setAlpha(0.5 + Math.sin(time / 60) * 0.5);
            if (this.safeTimer <= 0) { this.safeActive = false; this.player.clearTint(); this.player.setAlpha(1); this.safeCooldown = 15; this.safeCdText.setColor('#FF4444'); }
        } else if (this.safeCooldown > 0) {
            this.safeCooldown -= dt;
            this.safeCdText.setText(Math.ceil(this.safeCooldown) + 's');
            this.safeBtn.setAlpha(0.4);
            if (this.safeCooldown <= 0) { this.safeCooldown = 0; this.safeCdText.setText('READY'); this.safeCdText.setColor('#4499FF'); this.safeBtn.setAlpha(1); }
        }

        // Count alive
        const aliveAI = this.aiRacers.filter(a => a.alive).length;
        const totalRacers = 16;
        const crashed = totalRacers - aliveAI - (this.isCrashed ? 0 : 1);
        this.hud.distance.setText(Math.floor(this.distance)+'m');
        this.hud.position.setText('#' + Math.max(1, totalRacers - crashed - aliveAI + (this.isCrashed ? 0 : 1)));
        this.hud.alive.setText('Racers: ' + (aliveAI + (this.isCrashed ? 0 : 1)) + '/' + totalRacers);

        // Check win condition
        if (aliveAI === 0 && !this.isCrashed) {
            this.gameState = 'won';
            audio.stopMusic(); audio.playWin();
            SaveData.set('racesPlayed', SaveData.get('racesPlayed') + 1);
            SaveData.set('raceWins', SaveData.get('raceWins') + 1);
            SaveData.set('totalCoins', SaveData.get('totalCoins') + 50);
            this.time.delayedCall(500, () => this._showRaceEnd(true));
        }
    }

    moveLeft(){if(this.isCrashed||this.currentLane<=0)return;this.currentLane--;this.playerTargetX=LANE_X[this.currentLane];audio.playSwoosh();}
    moveRight(){if(this.isCrashed||this.currentLane>=4)return;this.currentLane++;this.playerTargetX=LANE_X[this.currentLane];audio.playSwoosh();}
    doJump(){if(this.isJumping||this.isCrashed)return;this.isJumping=true;audio.playJump();this.tweens.add({targets:this,playerVisualOffsetY:-30,duration:220,ease:'Quad.easeOut',yoyo:true,hold:160,onComplete:()=>{this.playerVisualOffsetY=0;this.isJumping=false;audio.playLand();}});this.tweens.add({targets:this.playerShadow,scaleX:0.4,scaleY:0.4,duration:220,yoyo:true,hold:160});}

    _activateSafe(){if(this.safeCooldown>0||this.safeActive||this.isCrashed||this.gameState!=='playing')return;this.safeActive=true;this.safeTimer=3;this.player.setTint(0x44FFFF);audio.playPowerup();this.cameras.main.flash(200,68,153,255,false,null,this);}
    _spawnBuilding(y){const type=this.bldTypes[Math.floor(Math.random()*this.bldTypes.length)];const side=Math.random()>0.5;const x=side?255:15;const b=this.add.image(x,y,type).setDepth(1);this.buildings.add(b);if(Math.random()>0.4){const x2=side?15:255;const type2=this.bldTypes[Math.floor(Math.random()*this.bldTypes.length)];const b2=this.add.image(x2,y+(Math.random()*20-10),type2).setDepth(1);this.buildings.add(b2);}}

    _doCrash(){if(this.isCrashed)return;this.isCrashed=true;this.gameState='gameover';audio.stopMusic();audio.playCrash();
        this.player.setTint(0xFF3333);this.tweens.add({targets:this.player,angle:90,alpha:0.5,duration:400});this.cameras.main.shake(300,0.01);
        SaveData.set('racesPlayed',SaveData.get('racesPlayed')+1);
        this.time.delayedCall(800,()=>{audio.playGameOver();this._showRaceEnd(false);});}

    _showPause(){
        this.pauseOverlay=this.add.rectangle(GAME_W/2,GAME_H/2,GAME_W,GAME_H,0x000000,0.6).setDepth(300);
        this.add.text(GAME_W/2,GAME_H/2-30,'PAUSED',{fontSize:'16px',fontFamily:'monospace',color:'#fff'}).setOrigin(0.5).setDepth(301);
        const resumeBtn=this.add.text(GAME_W/2,GAME_H/2+10,'RESUME',{fontSize:'12px',fontFamily:'monospace',color:'#fff',backgroundColor:'#3366CC',padding:{x:20,y:8}}).setOrigin(0.5).setDepth(301).setInteractive();
        const quitBtn=this.add.text(GAME_W/2,GAME_H/2+50,'QUIT',{fontSize:'12px',fontFamily:'monospace',color:'#fff',backgroundColor:'#663333',padding:{x:20,y:8}}).setOrigin(0.5).setDepth(301).setInteractive();
        resumeBtn.on('pointerdown',()=>{audio.playClick();this.gameState='playing';this.scene.restart();});
        quitBtn.on('pointerdown',()=>{audio.playClick();audio.stopMusic();this.scene.start('MainMenu');});
    }

    _showRaceEnd(won) {
        this.add.rectangle(GAME_W/2,GAME_H/2,GAME_W,GAME_H,0x000000,0.7).setDepth(200);
        const py=GAME_H/2-10;
        this.add.rectangle(GAME_W/2,py,210,200,0x222244,0.9).setDepth(201).setStrokeStyle(2,won?0x44aa44:0x4444aa);
        this.add.text(GAME_W/2,py-70,won?'YOU WIN!':'CRASHED!',{fontSize:'16px',fontFamily:'monospace',color:won?'#44FF44':'#FF4444',stroke:'#000',strokeThickness:2}).setOrigin(0.5).setDepth(202);
        this.add.text(GAME_W/2,py-40,'Distance: '+Math.floor(this.distance)+'m',{fontSize:'10px',fontFamily:'monospace',color:'#ddd'}).setOrigin(0.5).setDepth(202);
        if(won) this.add.text(GAME_W/2,py-20,'+40 coins!',{fontSize:'10px',fontFamily:'monospace',color:'#FFD700'}).setOrigin(0.5).setDepth(202);
        const aliveAI=this.aiRacers.filter(a=>a.alive).length;
        const deadAI=10-aliveAI;
        this.add.text(GAME_W/2,py+5,'Position: #'+(won?1:Math.max(2,11-deadAI)),{fontSize:'10px',fontFamily:'monospace',color:'#aaa'}).setOrigin(0.5).setDepth(202);

        const retBtn=this.add.text(GAME_W/2,py+40,'  RACE AGAIN  ',{fontSize:'11px',fontFamily:'monospace',color:'#fff',backgroundColor:'#CC6633',padding:{x:16,y:7}}).setOrigin(0.5).setDepth(202).setInteractive();
        const menuBtn=this.add.text(GAME_W/2,py+72,'  MENU  ',{fontSize:'11px',fontFamily:'monospace',color:'#fff',backgroundColor:'#555566',padding:{x:16,y:7}}).setOrigin(0.5).setDepth(202).setInteractive();
        retBtn.on('pointerdown',()=>{audio.playClick();this.scene.restart();});
        menuBtn.on('pointerdown',()=>{audio.playClick();this.scene.start('MainMenu');});
    }
}

// CONFIG moved to launcher.js
