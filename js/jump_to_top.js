// ============================================================
// JUMP TO THE TOP - Doodle Jump style vertical platformer
// Retro pixel art, procedural graphics, chip-tune audio
// ============================================================

const JTT_GAME_W = 270;
const JTT_GAME_H = 480;
const JTT_GRAVITY = 800;
const JTT_JUMP_VEL = -520;
const JTT_PLAYER_SPEED = 200;

// Music tracks for Jump to the Top
const JTT_MUSIC_TRACKS = [
    { name: 'Sky Climb', melody: [330,392,440,523,440,523,660,523, 440,392,440,523,660,784,660,523, 392,440,523,660,523,440,392,440, 523,440,392,330,392,440,392,330], bass: [165,165,220,220,262,262,330,262, 220,220,262,262,330,330,392,262, 196,196,262,262,330,330,220,220, 262,262,196,196,165,165,196,165], tempo: 0.2 },
    { name: 'Cloud Bounce', melody: [440,523,660,523,440,392,440,523, 660,784,880,784,660,523,440,523, 392,440,523,440,392,330,392,440, 523,660,523,440,392,330,294,330], bass: [220,220,262,262,330,330,262,262, 220,220,330,330,392,392,262,262, 196,196,262,262,330,330,220,220, 165,165,220,220,262,262,165,165], tempo: 0.18 },
];

// ============================================================
// TEXTURE GENERATION
// ============================================================
function generateJTTTextures(scene) {
    // Player standing
    createPixelTexture(scene, 'jtt_player', 16, 20, (g) => {
        // Shadow
        g.fillStyle(0x000000, 0.15); g.fillEllipse(8, 18, 14, 4);
        // Legs
        g.fillStyle(0x2a2a50); g.fillRect(4, 13, 3, 6); g.fillRect(9, 13, 3, 6);
        // Shoes
        g.fillStyle(0x884422); g.fillRect(3, 18, 4, 2); g.fillRect(9, 18, 4, 2);
        // Body
        g.fillStyle(0x3366CC); g.fillRect(3, 5, 10, 9);
        // Arms down
        g.fillStyle(0x3366CC); g.fillRect(0, 7, 4, 6); g.fillRect(12, 7, 4, 6);
        // Hands
        g.fillStyle(0xFFCC99); g.fillRect(0, 12, 3, 2); g.fillRect(13, 12, 3, 2);
        // Head
        g.fillStyle(0xFFCC99); g.fillRect(4, 0, 8, 6);
        // Eyes
        g.fillStyle(0x222222); g.fillRect(5, 2, 2, 2); g.fillRect(9, 2, 2, 2);
        // Hair
        g.fillStyle(0x553311); g.fillRect(4, 0, 8, 2);
    });

    // Player jumping (arms up)
    createPixelTexture(scene, 'jtt_player_jump', 16, 20, (g) => {
        // Legs together
        g.fillStyle(0x2a2a50); g.fillRect(5, 14, 3, 5); g.fillRect(8, 14, 3, 5);
        // Shoes
        g.fillStyle(0x884422); g.fillRect(4, 18, 4, 2); g.fillRect(8, 18, 4, 2);
        // Body
        g.fillStyle(0x3366CC); g.fillRect(3, 6, 10, 9);
        // Arms up
        g.fillStyle(0x3366CC); g.fillRect(0, 2, 4, 6); g.fillRect(12, 2, 4, 6);
        // Hands up
        g.fillStyle(0xFFCC99); g.fillRect(0, 0, 3, 3); g.fillRect(13, 0, 3, 3);
        // Head
        g.fillStyle(0xFFCC99); g.fillRect(4, 1, 8, 6);
        // Eyes (happy)
        g.fillStyle(0x222222); g.fillRect(5, 3, 2, 2); g.fillRect(9, 3, 2, 2);
        // Hair
        g.fillStyle(0x553311); g.fillRect(4, 0, 8, 2);
    });

    // Player falling (arms flailing)
    createPixelTexture(scene, 'jtt_player_fall', 16, 20, (g) => {
        // Legs spread
        g.fillStyle(0x2a2a50); g.fillRect(2, 14, 3, 5); g.fillRect(11, 14, 3, 5);
        // Shoes
        g.fillStyle(0x884422); g.fillRect(1, 18, 4, 2); g.fillRect(11, 18, 4, 2);
        // Body
        g.fillStyle(0x3366CC); g.fillRect(3, 6, 10, 9);
        // Arms out to sides
        g.fillStyle(0x3366CC); g.fillRect(0, 5, 4, 5); g.fillRect(12, 5, 4, 5);
        // Hands
        g.fillStyle(0xFFCC99); g.fillRect(0, 4, 3, 2); g.fillRect(13, 4, 3, 2);
        // Head
        g.fillStyle(0xFFCC99); g.fillRect(4, 0, 8, 6);
        // Eyes (scared - O O)
        g.fillStyle(0x222222); g.fillRect(5, 2, 2, 2); g.fillRect(9, 2, 2, 2);
        g.fillStyle(0xFFCC99); g.fillRect(6, 2, 1, 1); g.fillRect(10, 2, 1, 1);
        // Mouth open
        g.fillStyle(0x222222); g.fillRect(7, 5, 2, 1);
        // Hair
        g.fillStyle(0x553311); g.fillRect(4, 0, 8, 2);
    });

    // Grass platform
    createPixelTexture(scene, 'jtt_plat_grass', 50, 12, (g) => {
        g.fillStyle(0x5B3A1A); g.fillRect(2, 5, 46, 7); // dirt
        g.fillStyle(0x6B4A2A); g.fillRect(3, 6, 44, 5);
        g.fillStyle(0x33AA33); g.fillRect(0, 2, 50, 5); // grass top
        g.fillStyle(0x44CC44); g.fillRect(2, 3, 46, 3);
        // Grass blades
        g.fillStyle(0x55DD55); g.fillRect(5, 0, 2, 3); g.fillRect(15, 1, 2, 2); g.fillRect(25, 0, 2, 3); g.fillRect(35, 1, 2, 2); g.fillRect(43, 0, 2, 3);
    });

    // Tree branch platform
    createPixelTexture(scene, 'jtt_plat_branch', 45, 10, (g) => {
        g.fillStyle(0x5B3A1A); g.fillRect(0, 3, 45, 6); // main branch
        g.fillStyle(0x6B4A2A); g.fillRect(2, 4, 41, 4);
        g.fillStyle(0x7B5A3A); g.fillRect(5, 4, 35, 2); // highlight
        // Knots
        g.fillStyle(0x4A2A0A); g.fillRect(10, 4, 3, 3); g.fillRect(30, 4, 3, 3);
        // Small leaves
        g.fillStyle(0x33AA33); g.fillRect(0, 0, 6, 4); g.fillRect(39, 0, 6, 4);
    });

    // Leaf platform
    createPixelTexture(scene, 'jtt_plat_leaf', 40, 10, (g) => {
        g.fillStyle(0x228822); g.fillEllipse(20, 5, 40, 10);
        g.fillStyle(0x33AA33); g.fillEllipse(20, 4, 36, 8);
        g.fillStyle(0x44CC44); g.fillEllipse(18, 4, 28, 6);
        // Vein
        g.fillStyle(0x228822); g.fillRect(5, 4, 30, 1);
    });

    // Cloud platform
    createPixelTexture(scene, 'jtt_plat_cloud', 55, 14, (g) => {
        g.fillStyle(0xCCCCDD); g.fillEllipse(27, 8, 50, 12);
        g.fillStyle(0xDDDDEE); g.fillEllipse(20, 6, 30, 10);
        g.fillStyle(0xDDDDEE); g.fillEllipse(35, 6, 30, 10);
        g.fillStyle(0xEEEEFF); g.fillEllipse(27, 5, 36, 8);
        // Highlight
        g.fillStyle(0xFFFFFF, 0.5); g.fillEllipse(22, 4, 16, 4);
    });

    // Star platform
    createPixelTexture(scene, 'jtt_plat_star', 40, 12, (g) => {
        g.fillStyle(0xCC9900); g.fillRect(2, 4, 36, 6); // base
        g.fillStyle(0xFFAA00); g.fillRect(4, 5, 32, 4);
        g.fillStyle(0xFFDD00); g.fillRect(8, 5, 24, 3);
        // Sparkles
        g.fillStyle(0xFFFF88); g.fillRect(6, 2, 2, 2); g.fillRect(18, 1, 2, 2); g.fillRect(32, 2, 2, 2);
        g.fillStyle(0xFFFFCC); g.fillRect(12, 0, 1, 2); g.fillRect(26, 0, 1, 2);
    });

    // Breakable platform (cracked)
    createPixelTexture(scene, 'jtt_plat_break', 45, 10, (g) => {
        g.fillStyle(0x6B4A2A); g.fillRect(0, 3, 20, 7); // left half
        g.fillStyle(0x6B4A2A); g.fillRect(25, 3, 20, 7); // right half
        g.fillStyle(0x7B5A3A); g.fillRect(2, 4, 16, 5);
        g.fillStyle(0x7B5A3A); g.fillRect(27, 4, 16, 5);
        // Crack in middle
        g.fillStyle(0x332211); g.fillRect(20, 2, 1, 8); g.fillRect(21, 4, 2, 4); g.fillRect(23, 3, 1, 6);
        // Crumbs
        g.fillStyle(0x5B3A1A); g.fillRect(19, 8, 2, 2); g.fillRect(24, 7, 2, 2);
    });

    // Moving platform indicator (arrows on cloud)
    createPixelTexture(scene, 'jtt_plat_moving', 55, 14, (g) => {
        // Base cloud
        g.fillStyle(0xAAAACC); g.fillEllipse(27, 8, 50, 12);
        g.fillStyle(0xBBBBDD); g.fillEllipse(20, 6, 30, 10);
        g.fillStyle(0xBBBBDD); g.fillEllipse(35, 6, 30, 10);
        g.fillStyle(0xCCCCEE); g.fillEllipse(27, 5, 36, 8);
        // Arrow indicators
        g.fillStyle(0x8888AA); g.fillRect(8, 5, 6, 2); g.fillRect(5, 4, 3, 4);
        g.fillRect(41, 5, 6, 2); g.fillRect(47, 4, 3, 4);
    });

    // Background ground
    createPixelTexture(scene, 'jtt_bg_ground', JTT_GAME_W, 100, (g) => {
        g.fillStyle(0x5B3A1A); g.fillRect(0, 0, JTT_GAME_W, 100); // dirt
        g.fillStyle(0x33AA33); g.fillRect(0, 0, JTT_GAME_W, 15); // grass layer
        g.fillStyle(0x44CC44); g.fillRect(0, 0, JTT_GAME_W, 8);
        // Grass blades
        g.fillStyle(0x55DD55);
        for (let x = 0; x < JTT_GAME_W; x += 8) {
            const h = 3 + Math.floor(Math.random() * 5);
            g.fillRect(x, 0, 2, h);
        }
        // Dirt texture
        g.fillStyle(0x4A2A0A);
        for (let i = 0; i < 20; i++) {
            g.fillRect(Math.random() * JTT_GAME_W, 20 + Math.random() * 70, 3, 2);
        }
    });

    // Tree decoration (background)
    createPixelTexture(scene, 'jtt_tree_deco', 30, 60, (g) => {
        // Trunk
        g.fillStyle(0x553311); g.fillRect(11, 25, 8, 35);
        g.fillStyle(0x664422); g.fillRect(12, 26, 6, 33);
        // Foliage layers
        g.fillStyle(0x226622); g.fillEllipse(15, 18, 28, 24);
        g.fillStyle(0x338833); g.fillEllipse(15, 15, 24, 20);
        g.fillStyle(0x33AA33); g.fillEllipse(15, 12, 18, 16);
        g.fillStyle(0x44BB44); g.fillEllipse(13, 10, 12, 10);
    });

    // Cloud decoration (background)
    createPixelTexture(scene, 'jtt_cloud_deco', 40, 20, (g) => {
        g.fillStyle(0xDDDDEE, 0.4); g.fillEllipse(20, 12, 38, 16);
        g.fillStyle(0xEEEEFF, 0.4); g.fillEllipse(15, 10, 24, 14);
        g.fillStyle(0xEEEEFF, 0.4); g.fillEllipse(28, 10, 24, 14);
        g.fillStyle(0xFFFFFF, 0.3); g.fillEllipse(20, 8, 20, 10);
    });

    // Star decoration (background)
    createPixelTexture(scene, 'jtt_star_deco', 6, 6, (g) => {
        g.fillStyle(0xFFFFCC); g.fillRect(2, 0, 2, 6); g.fillRect(0, 2, 6, 2);
        g.fillStyle(0xFFFFFF); g.fillRect(2, 2, 2, 2);
    });

    // Coin (reuse from skateboard if exists, otherwise create)
    if (!scene.textures.exists('jtt_coin')) {
        createPixelTexture(scene, 'jtt_coin', 12, 12, (g) => {
            g.fillStyle(0xFFD700); g.fillEllipse(6, 6, 12, 12);
            g.fillStyle(0xFFE44D); g.fillEllipse(5, 5, 8, 8);
            g.fillStyle(0xCC9900); g.fillRect(5, 4, 2, 4);
        });
    }

    // Spring/bouncer power-up
    createPixelTexture(scene, 'jtt_spring', 14, 12, (g) => {
        g.fillStyle(0xCC3333); g.fillRect(1, 0, 12, 3); // top plate
        g.fillStyle(0xAAAAAA); // spring coils
        g.fillRect(3, 3, 2, 2); g.fillRect(7, 5, 2, 2); g.fillRect(3, 7, 2, 2); g.fillRect(7, 9, 2, 2);
        g.fillStyle(0x888888);
        g.fillRect(5, 4, 2, 2); g.fillRect(5, 8, 2, 2);
        g.fillStyle(0x666666); g.fillRect(2, 10, 10, 2); // base
    });
}

// ============================================================
// BOOT SCENE
// ============================================================
class JTTBootScene extends Phaser.Scene {
    constructor() { super('JTTBoot'); }
    create() {
        generateJTTTextures(this);
        this.scene.start('JTTMenu');
    }
}

// ============================================================
// MENU SCENE
// ============================================================
class JTTMenuScene extends Phaser.Scene {
    constructor() { super('JTTMenu'); }
    create() {
        audio.init();
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Sky gradient background
        const bgG = this.add.graphics();
        for (let y = 0; y < JTT_GAME_H; y++) {
            const t = y / JTT_GAME_H;
            const r = Math.floor(30 + t * 20);
            const g2 = Math.floor(60 + t * 80);
            const b = Math.floor(120 + t * 60);
            bgG.fillStyle(Phaser.Display.Color.GetColor(r, g2, b));
            bgG.fillRect(0, y, JTT_GAME_W, 1);
        }

        // Decorative clouds
        for (let i = 0; i < 5; i++) {
            const cx = 30 + Math.random() * 210;
            const cy = 80 + Math.random() * 200;
            this.add.image(cx, cy, 'jtt_cloud_deco').setAlpha(0.3).setScale(1 + Math.random());
        }

        // Title
        this.add.text(JTT_GAME_W / 2, 50, 'JUMP TO\nTHE TOP', {
            fontSize: '20px', fontFamily: 'monospace', color: '#FFD700',
            align: 'center', stroke: '#000', strokeThickness: 3, lineSpacing: 4
        }).setOrigin(0.5);

        // Player preview
        this.add.image(JTT_GAME_W / 2, 130, 'jtt_player_jump').setScale(3);

        // Floating platform preview
        this.add.image(JTT_GAME_W / 2, 155, 'jtt_plat_cloud').setScale(1.5);

        // Buttons
        const bx = JTT_GAME_W / 2;
        let by = 210;
        const gap = 40;
        makeBtn(this, bx, by, '    PLAY    ', '#3366CC', () => {
            audio.stopMusic();
            this.scene.start('JTTGame');
        });
        makeBtn(this, bx, by += gap, ' HIGH SCORES ', '#555566', () => {
            this.scene.start('JTTHighScores');
        });
        makeBtn(this, bx, by += gap, 'INSTRUCTIONS', '#555566', () => {
            this.scene.start('JTTInstructions');
        });
        makeBtn(this, bx, by += gap, 'BACK TO ARCADE', '#664444', () => {
            audio.stopMusic();
            this.scene.start('Launcher');
        });

        // Best height
        const best = SaveData.get('jttHighscore') || 0;
        const coins = SaveData.get('totalCoins') || 0;
        this.add.text(JTT_GAME_W / 2, 430, 'BEST HEIGHT: ' + best + 'm', {
            fontSize: '9px', fontFamily: 'monospace', color: '#88CCFF'
        }).setOrigin(0.5);
        this.add.text(JTT_GAME_W / 2, 445, 'COINS: $' + coins, {
            fontSize: '9px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5);

        // Start menu music
        if (!audio.musicPlaying) {
            audio.startMusic(SaveData.get('jttMusicTrack') || 0, JTT_MUSIC_TRACKS);
        }
    }
}

// ============================================================
// INSTRUCTIONS SCENE
// ============================================================
class JTTInstructionsScene extends Phaser.Scene {
    constructor() { super('JTTInstructions'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'HOW TO PLAY');

        const lines = [
            { t: 'CONTROLS', c: '#FFD700', y: 70 },
            { t: 'Swipe or Drag LEFT / RIGHT\nto move sideways', c: '#ccc', y: 95 },
            { t: 'You bounce automatically\nwhen landing on platforms!', c: '#ccc', y: 135 },
            { t: 'GOAL', c: '#FFD700', y: 180 },
            { t: 'Jump as HIGH as you can!\nDon\'t fall off the screen.\nCollect coins along the way.', c: '#ccc', y: 210 },
            { t: 'PLATFORMS', c: '#FFD700', y: 275 },
            { t: 'GREEN = safe ground\nBROWN = tree branches\nWHITE = clouds (some move!)\nCRACKED = breaks on landing!', c: '#aaa', y: 310 },
            { t: 'TIPS', c: '#FFD700', y: 380 },
            { t: 'Walk off one side of the\nscreen to appear on the other!', c: '#ccc', y: 405 },
        ];
        lines.forEach(l => this.add.text(JTT_GAME_W / 2, l.y, l.t, {
            fontSize: '9px', fontFamily: 'monospace', color: l.c, align: 'center', lineSpacing: 3
        }).setOrigin(0.5));

        makeBtn(this, JTT_GAME_W / 2, 448, '  BACK  ', '#555566', () => this.scene.start('JTTMenu'));
    }
}

// ============================================================
// HIGH SCORES SCENE
// ============================================================
class JTTHighScoresScene extends Phaser.Scene {
    constructor() { super('JTTHighScores'); }
    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        makeTitle(this, 'HIGH SCORES');

        const best = SaveData.get('jttHighscore') || 0;
        const totalGames = SaveData.get('jttGamesPlayed') || 0;

        this.add.text(JTT_GAME_W / 2, 100, 'BEST HEIGHT', { fontSize: '10px', fontFamily: 'monospace', color: '#FFD700' }).setOrigin(0.5);
        this.add.text(JTT_GAME_W / 2, 130, best + 'm', { fontSize: '20px', fontFamily: 'monospace', color: '#44FFFF', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);

        this.add.text(JTT_GAME_W / 2, 190, 'GAMES PLAYED', { fontSize: '10px', fontFamily: 'monospace', color: '#FFD700' }).setOrigin(0.5);
        this.add.text(JTT_GAME_W / 2, 215, '' + totalGames, { fontSize: '16px', fontFamily: 'monospace', color: '#ccc' }).setOrigin(0.5);

        this.add.text(JTT_GAME_W / 2, 275, 'TOTAL COINS', { fontSize: '10px', fontFamily: 'monospace', color: '#FFD700' }).setOrigin(0.5);
        this.add.text(JTT_GAME_W / 2, 300, '$' + (SaveData.get('totalCoins') || 0), { fontSize: '16px', fontFamily: 'monospace', color: '#FFD700' }).setOrigin(0.5);

        makeBtn(this, JTT_GAME_W / 2, 400, '  BACK  ', '#555566', () => this.scene.start('JTTMenu'));
    }
}

// ============================================================
// GAME SCENE - Main gameplay
// ============================================================
class JTTGameScene extends Phaser.Scene {
    constructor() { super('JTTGame'); }

    create() {
        audio.init();
        audio.resume();

        this.gameState = 'playing';
        this.heightScore = 0;
        this.maxHeight = 0;
        this.coinsCollected = 0;
        this.highestGeneratedY = JTT_GAME_H;
        this.platformCount = 0;
        this.lastSafePlatformY = JTT_GAME_H;

        // Physics world bounds (wide for wrap, tall for play)
        this.physics.world.setBounds(0, -100000, JTT_GAME_W, 200000);
        this.physics.world.gravity.y = JTT_GRAVITY;

        // Background - will be dynamically drawn
        this.bgGraphics = this.add.graphics().setDepth(0);
        this._drawBackground(0);

        // Background decorations group
        this.bgDecorations = this.add.group();

        // Ground
        this.groundImg = this.add.image(JTT_GAME_W / 2, JTT_GAME_H - 50, 'jtt_bg_ground').setDepth(1);

        // Platform group
        this.platforms = this.physics.add.staticGroup();

        // Create ground platform (full width)
        const ground = this.platforms.create(JTT_GAME_W / 2, JTT_GAME_H - 10, 'jtt_plat_grass');
        ground.setScale(JTT_GAME_W / 50, 1).refreshBody();
        ground.body.setSize(JTT_GAME_W, 8);
        ground.body.setOffset(-110, 2);
        ground.platType = 'ground';
        ground.setDepth(5);

        // Coins group
        this.coins = this.physics.add.group({ allowGravity: false });

        // Springs group
        this.springs = this.physics.add.staticGroup();

        // Generate initial platforms
        this._generatePlatforms(JTT_GAME_H - 80, 0);

        // Player
        this.player = this.physics.add.sprite(JTT_GAME_W / 2, JTT_GAME_H - 40, 'jtt_player');
        this.player.setDepth(10);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(false);
        this.player.body.setSize(12, 16);
        this.player.body.setOffset(2, 4);

        // Collisions
        this.physics.add.collider(this.player, this.platforms, this._onPlatformLand, this._checkFallingDown, this);
        this.physics.add.overlap(this.player, this.coins, this._collectCoin, null, this);
        this.physics.add.collider(this.player, this.springs, this._onSpringBounce, this._checkFallingDown, this);

        // Camera - follow player but only upward
        this.cameraY = 0;
        this.cameras.main.setScroll(0, 0);

        // UI (fixed to camera)
        this.heightText = this.add.text(JTT_GAME_W / 2, 10, '0m', {
            fontSize: '12px', fontFamily: 'monospace', color: '#fff',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0).setDepth(100).setScrollFactor(0);

        this.coinText = this.add.text(JTT_GAME_W - 10, 10, '$0', {
            fontSize: '10px', fontFamily: 'monospace', color: '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

        // Pause button
        const pauseBtn = this.add.text(10, 8, '||', {
            fontSize: '14px', fontFamily: 'monospace', color: '#fff',
            stroke: '#000', strokeThickness: 2
        }).setDepth(100).setScrollFactor(0).setInteractive();
        pauseBtn.on('pointerdown', () => { if (this.gameState === 'playing') { this.gameState = 'paused'; this._showPause(); } });

        // Input - keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');

        // Input - touch/mouse drag
        this.touchStartX = null;
        this.isDragging = false;
        this.input.on('pointerdown', (p) => {
            if (this.gameState !== 'playing') return;
            audio.resume();
            this.touchStartX = p.x;
            this.isDragging = true;
        });
        this.input.on('pointermove', (p) => {
            if (!this.isDragging || this.gameState !== 'playing') return;
            const dx = p.x - this.touchStartX;
            this.player.setVelocityX(dx * 3);
        });
        this.input.on('pointerup', () => {
            this.isDragging = false;
            if (this.gameState === 'playing') this.player.setVelocityX(0);
        });

        // Start music
        audio.startMusic(0, JTT_MUSIC_TRACKS);
    }

    update(time, delta) {
        if (this.gameState !== 'playing') return;

        // Keyboard movement
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.player.setVelocityX(-JTT_PLAYER_SPEED);
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.player.setVelocityX(JTT_PLAYER_SPEED);
        } else if (!this.isDragging) {
            this.player.setVelocityX(0);
        }

        // Screen wrap
        if (this.player.x < -8) this.player.x = JTT_GAME_W + 8;
        if (this.player.x > JTT_GAME_W + 8) this.player.x = -8;

        // Update player sprite based on velocity
        if (this.player.body.velocity.y < -50) {
            this.player.setTexture('jtt_player_jump');
        } else if (this.player.body.velocity.y > 100) {
            this.player.setTexture('jtt_player_fall');
        } else {
            this.player.setTexture('jtt_player');
        }

        // Camera follows player upward only
        const targetCamY = this.player.y - JTT_GAME_H * 0.35;
        if (targetCamY < this.cameraY) {
            this.cameraY = targetCamY;
            this.cameras.main.setScroll(0, this.cameraY);
        }

        // Update height score
        const currentHeight = Math.floor((JTT_GAME_H - this.player.y) / 10);
        if (currentHeight > this.maxHeight) {
            this.maxHeight = currentHeight;
        }
        this.heightText.setText(this.maxHeight + 'm');

        // Generate new platforms above camera
        const cameraTop = this.cameraY;
        if (cameraTop < this.highestGeneratedY + JTT_GAME_H) {
            const newTop = this.highestGeneratedY - JTT_GAME_H;
            this._generatePlatforms(this.highestGeneratedY, newTop);
            this.highestGeneratedY = newTop;
        }

        // Clean up below camera
        this._cleanupBelow();

        // Update background
        this._drawBackground(this.cameraY);

        // Update moving platforms
        this.platforms.getChildren().forEach(p => {
            if (p.platType === 'moving' && p.active) {
                p.moveTimer = (p.moveTimer || 0) + delta * 0.001;
                const newX = p.origX + Math.sin(p.moveTimer * p.moveSpeed) * p.moveRange;
                p.setX(newX);
                p.refreshBody();
            }
        });

        // Game over - fell below camera
        if (this.player.y > this.cameraY + JTT_GAME_H + 50) {
            this._gameOver();
        }
    }

    _checkFallingDown(player, platform) {
        return player.body.velocity.y > 0 && player.body.bottom <= platform.body.top + 10;
    }

    _onPlatformLand(player, platform) {
        if (platform.platType === 'breakable') {
            audio.playBreak ? audio.playBreak() : audio.playCrash();
            this.tweens.add({
                targets: platform,
                alpha: 0, y: platform.y + 30,
                duration: 300,
                onComplete: () => { platform.destroy(); }
            });
            // Still bounce off it
        }

        // Bounce!
        player.setVelocityY(JTT_JUMP_VEL);
        if (audio.playBounce) {
            audio.playBounce();
        } else {
            audio.playJump();
        }
    }

    _onSpringBounce(player, spring) {
        // Super bounce!
        player.setVelocityY(JTT_JUMP_VEL * 1.6);
        if (audio.playPowerup) audio.playPowerup();

        this.tweens.add({
            targets: spring,
            scaleY: 0.5, duration: 100, yoyo: true
        });
    }

    _collectCoin(player, coin) {
        audio.playCoin();
        this.coinsCollected++;
        this.coinText.setText('$' + this.coinsCollected);

        // Coin pop effect
        this.tweens.add({
            targets: coin, alpha: 0, scaleX: 2, scaleY: 2, y: coin.y - 20,
            duration: 200, onComplete: () => coin.destroy()
        });
    }

    _generatePlatforms(fromY, toY) {
        let y = fromY;
        let consecutiveHazards = 0;

        while (y > toY) {
            // Vertical gap - scaled by height
            const height = JTT_GAME_H - y;
            const difficultyFactor = Math.min(height / 15000, 1);
            const minGap = 55 + difficultyFactor * 10;
            const maxGap = 90 + difficultyFactor * 40;
            const gap = minGap + Math.random() * (maxGap - minGap);
            y -= gap;

            // Random X
            const platWidth = this._getPlatformWidth(height);
            const x = platWidth / 2 + Math.random() * (JTT_GAME_W - platWidth);

            // Choose platform type
            const type = this._choosePlatformType(height, consecutiveHazards);

            // Create platform
            const plat = this._createPlatform(x, y, type);

            if (type === 'breakable' || type === 'moving') {
                consecutiveHazards++;
            } else {
                consecutiveHazards = 0;
                this.lastSafePlatformY = y;
            }

            // Coin chance (~35%)
            if (Math.random() < 0.35) {
                const coin = this.coins.create(x + (Math.random() - 0.5) * 30, y - 25, 'jtt_coin');
                coin.setDepth(8);
                // Gentle float animation
                this.tweens.add({
                    targets: coin, y: coin.y - 5, duration: 800,
                    yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
            }

            // Spring chance (rare, ~5%)
            if (Math.random() < 0.05 && type !== 'breakable' && type !== 'moving') {
                const spring = this.springs.create(x, y - 10, 'jtt_spring');
                spring.setDepth(7);
                spring.refreshBody();
            }

            // Background decorations
            this._addBackgroundDecoration(y, height);

            this.platformCount++;
        }
    }

    _getPlatformWidth(height) {
        if (height < 2000) return 50;
        if (height < 5000) return 45;
        if (height < 8000) return 40;
        return 35;
    }

    _choosePlatformType(height, consecutiveHazards) {
        // Safety: force safe platform after 2 hazards
        if (consecutiveHazards >= 2) {
            if (height < 2000) return 'grass';
            if (height < 5000) return 'branch';
            if (height < 8000) return 'cloud';
            return 'star';
        }

        const roll = Math.random();
        const diff = Math.min(height / 15000, 1);

        // Breakable chance
        if (roll < 0.05 + diff * 0.15) return 'breakable';
        // Moving chance
        if (roll < 0.08 + diff * 0.22) return 'moving';

        // Normal platform by zone
        if (height < 2000) return 'grass';
        if (height < 3000) return Math.random() < 0.6 ? 'grass' : 'branch';
        if (height < 5000) return Math.random() < 0.6 ? 'branch' : 'leaf';
        if (height < 8000) return Math.random() < 0.5 ? 'leaf' : 'cloud';
        if (height < 12000) return Math.random() < 0.7 ? 'cloud' : 'star';
        return 'star';
    }

    _createPlatform(x, y, type) {
        let textureKey;
        switch (type) {
            case 'grass': textureKey = 'jtt_plat_grass'; break;
            case 'branch': textureKey = 'jtt_plat_branch'; break;
            case 'leaf': textureKey = 'jtt_plat_leaf'; break;
            case 'cloud': textureKey = 'jtt_plat_cloud'; break;
            case 'star': textureKey = 'jtt_plat_star'; break;
            case 'breakable': textureKey = 'jtt_plat_break'; break;
            case 'moving': textureKey = 'jtt_plat_moving'; break;
            default: textureKey = 'jtt_plat_grass';
        }

        const plat = this.platforms.create(x, y, textureKey);
        plat.setDepth(5);
        plat.platType = type;

        // Adjust body size to match platform visual
        const tex = this.textures.get(textureKey).getSourceImage();
        plat.body.setSize(tex.width - 4, 6);
        plat.body.setOffset(2, 2);
        plat.refreshBody();

        // Moving platform setup
        if (type === 'moving') {
            plat.origX = x;
            plat.moveSpeed = 1.5 + Math.random() * 2;
            plat.moveRange = 30 + Math.random() * 40;
            plat.moveTimer = Math.random() * Math.PI * 2;
        }

        return plat;
    }

    _addBackgroundDecoration(y, height) {
        // Only occasionally
        if (Math.random() > 0.3) return;

        const side = Math.random() < 0.5 ? -5 : JTT_GAME_W + 5;
        const x = side < 0 ? Math.random() * 40 : JTT_GAME_W - Math.random() * 40;

        if (height < 3000 && Math.random() < 0.5) {
            // Trees
            const tree = this.add.image(x, y + 20, 'jtt_tree_deco').setAlpha(0.3).setDepth(1);
            this.bgDecorations.add(tree);
        } else if (height >= 3000 && height < 10000) {
            // Clouds
            const cloud = this.add.image(Math.random() * JTT_GAME_W, y, 'jtt_cloud_deco').setAlpha(0.2).setDepth(1);
            this.bgDecorations.add(cloud);
        } else if (height >= 10000) {
            // Stars
            for (let i = 0; i < 3; i++) {
                const star = this.add.image(Math.random() * JTT_GAME_W, y - Math.random() * 100, 'jtt_star_deco').setAlpha(0.5 + Math.random() * 0.5).setDepth(1);
                this.bgDecorations.add(star);
            }
        }
    }

    _drawBackground(camY) {
        this.bgGraphics.clear();
        const height = JTT_GAME_H - camY;

        for (let sy = 0; sy < JTT_GAME_H; sy++) {
            const worldY = camY + sy;
            const h = JTT_GAME_H - worldY;
            let r, g, b;

            if (h < 2000) {
                // Ground zone: green-blue sky
                const t = sy / JTT_GAME_H;
                r = Math.floor(50 + t * 30);
                g = Math.floor(120 + t * 50);
                b = Math.floor(180 - t * 30);
            } else if (h < 5000) {
                // Tree zone: blue sky
                const t = sy / JTT_GAME_H;
                r = Math.floor(40 + t * 20);
                g = Math.floor(100 + t * 60);
                b = Math.floor(200 - t * 20);
            } else if (h < 10000) {
                // Cloud zone: light blue
                const t = sy / JTT_GAME_H;
                r = Math.floor(80 + t * 40);
                g = Math.floor(150 + t * 50);
                b = Math.floor(220 - t * 10);
            } else {
                // Space zone: dark with stars
                const t = sy / JTT_GAME_H;
                r = Math.floor(10 + t * 15);
                g = Math.floor(10 + t * 20);
                b = Math.floor(40 + t * 30);
            }

            this.bgGraphics.fillStyle(Phaser.Display.Color.GetColor(
                Math.min(255, Math.max(0, r)),
                Math.min(255, Math.max(0, g)),
                Math.min(255, Math.max(0, b))
            ));
            this.bgGraphics.fillRect(0, camY + sy, JTT_GAME_W, 1);
        }
    }

    _cleanupBelow() {
        const cameraBottom = this.cameraY + JTT_GAME_H + 200;

        this.platforms.getChildren().forEach(p => {
            if (p.y > cameraBottom) p.destroy();
        });
        this.coins.getChildren().forEach(c => {
            if (c.y > cameraBottom) c.destroy();
        });
        this.springs.getChildren().forEach(s => {
            if (s.y > cameraBottom) s.destroy();
        });
        this.bgDecorations.getChildren().forEach(d => {
            if (d.y > cameraBottom + 100) d.destroy();
        });
    }

    _gameOver() {
        if (this.gameState === 'gameover') return;
        this.gameState = 'gameover';
        audio.stopMusic();
        audio.playGameOver();

        // Flash player red
        this.player.setTint(0xFF3333);
        this.tweens.add({
            targets: this.player, alpha: 0.3, duration: 500
        });

        // Save data
        const currentBest = SaveData.get('jttHighscore') || 0;
        if (this.maxHeight > currentBest) {
            SaveData.set('jttHighscore', this.maxHeight);
        }
        SaveData.set('totalCoins', (SaveData.get('totalCoins') || 0) + this.coinsCollected);
        SaveData.set('jttGamesPlayed', (SaveData.get('jttGamesPlayed') || 0) + 1);

        // Show game over after delay
        this.time.delayedCall(800, () => {
            this._showGameOver();
        });
    }

    _showGameOver() {
        // Overlay
        this.add.rectangle(JTT_GAME_W / 2, JTT_GAME_H / 2, JTT_GAME_W, JTT_GAME_H, 0x000000, 0.7)
            .setDepth(200).setScrollFactor(0);

        // Stats panel at top
        this.add.rectangle(JTT_GAME_W / 2, 70, 220, 110, 0x222244, 0.95)
            .setDepth(201).setStrokeStyle(2, 0x4444aa).setScrollFactor(0);

        this.add.text(JTT_GAME_W / 2, 30, 'GAME OVER', {
            fontSize: '14px', fontFamily: 'monospace', color: '#FF4444',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0);

        this.add.text(JTT_GAME_W / 2, 55, 'Height: ' + this.maxHeight + 'm', {
            fontSize: '11px', fontFamily: 'monospace', color: '#88CCFF'
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0);

        const best = SaveData.get('jttHighscore') || 0;
        const isNew = this.maxHeight >= best;
        this.add.text(JTT_GAME_W / 2, 75, (isNew ? 'NEW BEST!' : 'Best: ' + best + 'm'), {
            fontSize: '9px', fontFamily: 'monospace', color: isNew ? '#FFD700' : '#888'
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0);

        this.add.text(JTT_GAME_W / 2, 95, 'Coins: +$' + this.coinsCollected, {
            fontSize: '9px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0);

        // Name entry for leaderboard
        this.add.text(JTT_GAME_W / 2, 135, 'ENTER YOUR NAME', {
            fontSize: '8px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0);

        const score = this.maxHeight;
        const self = this;
        showNameInput(this, JTT_GAME_W / 2, 152, 202, (name, inputGroup) => {
            if (name) {
                Leaderboard.submit(name, score, 'jumptotop').then(() => {
                    inputGroup.forEach(o => o.destroy());
                    self._showJTTPostButtons();
                });
            } else {
                self._showJTTPostButtons();
            }
        }, { scrollFactor: 0 });
    }
    _showJTTPostButtons() {
        const retryBtn = this.add.text(JTT_GAME_W / 2, GAME_H - 90, '  TRY AGAIN  ', {
            fontSize: '11px', fontFamily: 'monospace', color: '#fff',
            backgroundColor: '#3366CC', padding: { x: 16, y: 7 }
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setInteractive();

        const menuBtn = this.add.text(JTT_GAME_W / 2, GAME_H - 55, '    MENU    ', {
            fontSize: '11px', fontFamily: 'monospace', color: '#fff',
            backgroundColor: '#555566', padding: { x: 16, y: 7 }
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setInteractive();

        const gamesBtn = this.add.text(JTT_GAME_W / 2, GAME_H - 20, ' ALL GAMES  ', {
            fontSize: '11px', fontFamily: 'monospace', color: '#fff',
            backgroundColor: '#664444', padding: { x: 16, y: 7 }
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setInteractive();

        retryBtn.on('pointerdown', () => { audio.playClick(); this.scene.restart(); });
        menuBtn.on('pointerdown', () => { audio.playClick(); this.scene.start('JTTMenu'); });
        gamesBtn.on('pointerdown', () => { audio.playClick(); this.scene.start('Launcher'); });
    }

    _showPause() {
        const cy = JTT_GAME_H / 2;
        this.pauseOverlay = this.add.rectangle(JTT_GAME_W / 2, cy, JTT_GAME_W, JTT_GAME_H, 0x000000, 0.6)
            .setDepth(300).setScrollFactor(0);

        this.add.text(JTT_GAME_W / 2, cy - 30, 'PAUSED', {
            fontSize: '16px', fontFamily: 'monospace', color: '#fff'
        }).setOrigin(0.5).setDepth(301).setScrollFactor(0);

        const resumeBtn = this.add.text(JTT_GAME_W / 2, cy + 10, 'RESUME', {
            fontSize: '12px', fontFamily: 'monospace', color: '#fff',
            backgroundColor: '#3366CC', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setDepth(301).setScrollFactor(0).setInteractive();

        const quitBtn = this.add.text(JTT_GAME_W / 2, cy + 50, 'QUIT', {
            fontSize: '12px', fontFamily: 'monospace', color: '#fff',
            backgroundColor: '#663333', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setDepth(301).setScrollFactor(0).setInteractive();

        resumeBtn.on('pointerdown', () => { audio.playClick(); this.scene.restart(); });
        quitBtn.on('pointerdown', () => { audio.playClick(); audio.stopMusic(); this.scene.start('JTTMenu'); });
    }
}
