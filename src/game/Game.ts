import * as PIXI from 'pixi.js';
import type { Difficulty, GameConfig, GameState, Move, Player, Position, WinInfo } from '../types';
import { Board } from './Board';
import { AIFactory } from './AIFactory';
import { Animation } from './Animation';
import { Sound } from './Sound';
import { GameRecorder } from './GameRecorder';
import { ReplayUI } from './ReplayUI';

export class Game {
    private app: PIXI.Application;
    private board: Board;
    private ai: AIFactory;
    private animation: Animation;
    private sound: Sound;
    private state: GameState;
    private config: GameConfig;
    private replayUI: ReplayUI;

    constructor(container: HTMLElement) {
        this.config = {
            boardSize: 15,
            cellSize: 40,
            backgroundColor: 0xE6B87A,
            lineColor: 0x000000,
            blackStoneColor: 0x000000,
            whiteStoneColor: 0xFFFFFF
        };

        this.app = new PIXI.Application({
            width: this.config.boardSize * this.config.cellSize,
            height: this.config.boardSize * this.config.cellSize,
            backgroundColor: this.config.backgroundColor,
            antialias: true
        });

        container.appendChild(this.app.view as HTMLCanvasElement);

        this.board = new Board(this.config);
        this.ai = new AIFactory(this.config.boardSize);
        this.animation = new Animation(this.app);
        this.sound = new Sound();
        
        this.state = {
            board: Array(this.config.boardSize).fill(null)
                .map(() => Array(this.config.boardSize).fill(null)),
            currentPlayer: 'black',
            winner: null,
            isGameOver: false,
            moves: [],
            startTime: Date.now()
        };

        this.setupGame();
        this.setupControls();

        // 初始化回放界面
        this.replayUI = new ReplayUI(container, this);
    }

    private setupGame(): void {
        this.app.stage.addChild(this.board);
        this.board.position.set(0, 0);

        this.board.on('cell-click', this.handlePlayerMove.bind(this));
        
        // 开始播放背景音乐
        this.sound.playSound('background');
    }

    private setupControls(): void {
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        controls.style.display = 'flex';
        controls.style.gap = '10px';
        controls.style.justifyContent = 'center';

        // 添加音效控制按钮
        const muteButton = document.createElement('button');
        muteButton.textContent = '🔊 音效开/关';
        muteButton.onclick = () => {
            this.sound.toggleMute();
            const newText = muteButton.textContent?.startsWith('🔊') ? '🔇 音效开/关' : '🔊 音效开/关';
            muteButton.textContent = newText;
        };

        // 添加难度选择
        const difficultySelect = document.createElement('select');
        difficultySelect.innerHTML = `
            <option value="easy">简单</option>
            <option value="medium" selected>中等</option>
            <option value="hard">困难</option>
        `;
        difficultySelect.onchange = () => {
            this.ai.setDifficulty(difficultySelect.value as Difficulty);
            this.restart();
        };

        // 添加重新开始按钮
        const restartButton = document.createElement('button');
        restartButton.textContent = '🔄 重新开始';
        restartButton.onclick = () => this.restart();

        controls.appendChild(muteButton);
        controls.appendChild(difficultySelect);
        controls.appendChild(restartButton);

        // 将控制按钮添加到游戏容器下方
        const canvas = this.app.view as HTMLCanvasElement;
        canvas.parentElement?.parentElement?.appendChild(controls);
    }

    private async handlePlayerMove(pos: Position): Promise<void> {
        if (this.state.isGameOver || this.state.currentPlayer !== 'black') {
            return;
        }

        if (await this.makeMove(pos)) {
            if (!this.state.isGameOver) {
                this.switchPlayer();
                this.makeAIMove();
            }
        }
    }

    private async makeMove(pos: Position): Promise<boolean> {
        const result = this.board.placeStone(pos, this.state.currentPlayer);
        if (!result || typeof result === 'boolean') {
            return false;
        }

        // 记录这一步
        const move: Move = {
            position: pos,
            player: this.state.currentPlayer,
            timestamp: Date.now()
        };
        this.state.moves.push(move);

        // 播放落子动画和音效
        await Promise.all([
            this.animation.playStoneAnimation(result, pos),
            this.sound.playSound('place')
        ]);

        const winInfo = this.board.checkWin(pos);
        if (winInfo) {
            this.state.winner = winInfo.player;
            this.state.isGameOver = true;
            this.handleGameOver(winInfo);
        }

        return true;
    }

    private makeAIMove(): void {
        setTimeout(async () => {
            const aiMove = this.ai.getNextMove(this.board.getBoard(), this.state.currentPlayer);
            if (await this.makeMove(aiMove)) {
                if (!this.state.isGameOver) {
                    this.switchPlayer();
                }
            }
        }, 500);
    }

    private switchPlayer(): void {
        this.state.currentPlayer = this.state.currentPlayer === 'black' ? 'white' : 'black';
    }

    private async handleGameOver(winInfo: WinInfo): Promise<void> {
        const message = winInfo.player === 'black' ? '黑棋获胜！' : '白棋获胜！';
        console.log(message);

        // 保存游戏记录
        GameRecorder.saveGame(
            this.state.moves,
            this.state.winner,
            this.state.startTime
        );

        // 播放胜利音效和动画
        await Promise.all([
            this.sound.playSound('win'),
            this.animation.playWinningLineAnimation(winInfo.line.start, winInfo.line.end)
        ]);

        // 显示胜利消息
        this.showGameOverMessage(message);
    }

    private showGameOverMessage(message: string): void {
        const messageElement = document.createElement('div');
        messageElement.style.position = 'absolute';
        messageElement.style.top = '50%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translate(-50%, -50%)';
        messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        messageElement.style.color = 'white';
        messageElement.style.padding = '20px';
        messageElement.style.borderRadius = '10px';
        messageElement.style.fontSize = '24px';
        messageElement.textContent = message;

        const canvas = this.app.view as HTMLCanvasElement;
        canvas.parentElement?.appendChild(messageElement);

        // 3秒后自动移除消息
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    public async replayMove(pos: Position): Promise<boolean> {
        return this.makeMove(pos);
    }

    public restart(): void {
        this.board.reset();
        this.state = {
            board: Array(this.config.boardSize).fill(null)
                .map(() => Array(this.config.boardSize).fill(null)),
            currentPlayer: 'black',
            winner: null,
            isGameOver: false,
            moves: [],
            startTime: Date.now()
        };
    }
} 