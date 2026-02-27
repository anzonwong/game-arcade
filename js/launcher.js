// ============================================================
// GAME ARCADE LAUNCHER
// Game selection screen + Phaser config
// ============================================================

// ============================================================
// LAUNCHER SCENE
// ============================================================
class LauncherScene extends Phaser.Scene {
    constructor() { super('Launcher'); }

    create() {
        audio.init();
        audio.stopMusic();
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Background gradient
        const bgG = this.add.graphics();
        for (let y = 0; y < GAME_H; y++) {
            const t = y / GAME_H;
            const r = Math.floor(15 + t * 15);
            const gv = Math.floor(15 + t * 20);
            const b = Math.floor(35 + t * 25);
            bgG.fillStyle(Phaser.Display.Color.GetColor(r, gv, b));
            bgG.fillRect(0, y, GAME_W, 1);
        }

        // Decorative stars in background
        const starG = this.add.graphics();
        for (let i = 0; i < 30; i++) {
            const sx = Math.random() * GAME_W;
            const sy = Math.random() * GAME_H;
            const alpha = 0.3 + Math.random() * 0.7;
            starG.fillStyle(0xFFFFFF, alpha);
            starG.fillRect(sx, sy, 1, 1);
            if (Math.random() < 0.3) {
                starG.fillRect(sx - 1, sy, 3, 1);
                starG.fillRect(sx, sy - 1, 1, 3);
            }
        }

        // Title
        this.add.text(GAME_W / 2, 40, 'GAME\nARCADE', {
            fontSize: '22px', fontFamily: 'monospace', color: '#FFD700',
            align: 'center', stroke: '#000', strokeThickness: 4, lineSpacing: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(GAME_W / 2, 90, 'Choose a game', {
            fontSize: '9px', fontFamily: 'monospace', color: '#888'
        }).setOrigin(0.5);

        // ---- Game 1: Skateboard Jumps ----
        this._drawGameCard(170, 'SKATEBOARD JUMPS', 0x3366CC, 'Endless runner\non a motorway!', () => {
            this.scene.start('MainMenu');
        }, 'skateboard');

        // ---- Game 2: Jump to the Top ----
        this._drawGameCard(310, 'JUMP TO THE TOP', 0x33AA66, 'Bounce your way\nup to the sky!', () => {
            this.scene.start('JTTBoot');
        }, 'jumptotop');

        // Footer
        this.add.text(GAME_W / 2, 440, 'TOTAL COINS: $' + (SaveData.get('totalCoins') || 0), {
            fontSize: '9px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5);

        this.add.text(GAME_W / 2, 460, 'v1.0', {
            fontSize: '7px', fontFamily: 'monospace', color: '#444'
        }).setOrigin(0.5);
    }

    _drawGameCard(y, title, color, subtitle, onClick, gameType) {
        const cardX = 20;
        const cardW = GAME_W - 40;
        const cardH = 100;
        const cardTop = y - 45;

        // Card background
        const card = this.add.graphics();
        card.fillStyle(color, 0.2);
        card.fillRect(cardX, cardTop, cardW, cardH);
        card.lineStyle(2, color, 0.7);
        card.strokeRect(cardX, cardTop, cardW, cardH);

        // Game icon area (left side)
        const iconG = this.add.graphics();
        if (gameType === 'skateboard') {
            // Mini road
            iconG.fillStyle(0x333340); iconG.fillRect(32, y - 25, 40, 50);
            // Lane lines
            iconG.fillStyle(0xCCCCCC); iconG.fillRect(42, y - 25, 1, 50); iconG.fillRect(62, y - 25, 1, 50);
            // Skater figure
            iconG.fillStyle(0xFFCC99); iconG.fillRect(47, y - 5, 6, 5); // head
            iconG.fillStyle(0x3366CC); iconG.fillRect(46, y, 8, 10); // body
            iconG.fillStyle(0x2a2a50); iconG.fillRect(47, y + 10, 3, 6); iconG.fillRect(52, y + 10, 3, 6); // legs
            iconG.fillStyle(0x8B4513); iconG.fillRect(44, y + 16, 14, 3); // board
            iconG.fillStyle(0x444444); iconG.fillRect(45, y + 19, 3, 2); iconG.fillRect(54, y + 19, 3, 2); // wheels
        } else {
            // Platforms at different heights
            iconG.fillStyle(0x44AA44); iconG.fillRect(32, y + 15, 40, 8); // ground
            iconG.fillStyle(0x33AA33); iconG.fillRect(38, y + 2, 22, 5); // grass plat
            iconG.fillStyle(0x6B4A2A); iconG.fillRect(42, y - 10, 18, 4); // branch
            iconG.fillStyle(0xDDDDEE); iconG.fillRect(36, y - 22, 24, 5); // cloud
            // Player figure
            iconG.fillStyle(0xFFCC99); iconG.fillRect(49, y - 32, 6, 5); // head
            iconG.fillStyle(0x3366CC); iconG.fillRect(48, y - 27, 8, 8); // body
            iconG.fillStyle(0x3366CC); iconG.fillRect(45, y - 30, 3, 5); iconG.fillRect(56, y - 30, 3, 5); // arms up
            // Arrow up
            iconG.fillStyle(0xFFDD00); iconG.fillRect(50, y - 40, 4, 6);
            iconG.fillRect(48, y - 38, 8, 2);
        }

        // Title text
        this.add.text(80, y - 15, title, {
            fontSize: '11px', fontFamily: 'monospace', color: '#fff'
        });

        // Subtitle
        this.add.text(80, y + 5, subtitle, {
            fontSize: '8px', fontFamily: 'monospace', color: '#aaa', lineSpacing: 2
        });

        // Clickable area over entire card
        const hitArea = this.add.rectangle(GAME_W / 2, y, cardW, cardH, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            card.clear();
            card.fillStyle(color, 0.4);
            card.fillRect(cardX, cardTop, cardW, cardH);
            card.lineStyle(2, color, 1);
            card.strokeRect(cardX, cardTop, cardW, cardH);
        });

        hitArea.on('pointerout', () => {
            card.clear();
            card.fillStyle(color, 0.2);
            card.fillRect(cardX, cardTop, cardW, cardH);
            card.lineStyle(2, color, 0.7);
            card.strokeRect(cardX, cardTop, cardW, cardH);
        });

        hitArea.on('pointerdown', () => {
            audio.playClick();
            onClick();
        });
    }
}

// ============================================================
// PHASER CONFIG - All scenes from both games
// ============================================================
const config = {
    type: Phaser.AUTO,
    width: GAME_W,
    height: GAME_H,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [
        // Skateboard Jumps scenes (BootScene runs first, then goes to Launcher)
        BootScene, LauncherScene, MainMenuScene, InstructionsScene,
        CharSelectScene, ShopScene, ChatScene, SettingsScene,
        HighScoresScene, GameScene, RaceScene,
        // Jump to the Top scenes
        JTTBootScene, JTTMenuScene, JTTInstructionsScene,
        JTTHighScoresScene, JTTGameScene
    ],
    input: { activePointers: 2 },
    render: { antialias: false, roundPixels: true },
};

new Phaser.Game(config);
