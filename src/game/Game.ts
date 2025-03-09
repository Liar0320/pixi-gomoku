import * as PIXI from 'pixi.js';
import type { GameConfig, GameState, Player, Position } from '../types';
import { Board } from './Board';
import { AI } from './AI';

export class Game {
    private app: PIXI.Application;
    private board: Board;
    private ai: AI;
    private state: GameState;
    private config: GameConfig;

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
        this.ai = new AI(this.config.boardSize);
        
        this.state = {
            board: Array(this.config.boardSize).fill(null)
                .map(() => Array(this.config.boardSize).fill(null)),
            currentPlayer: 'black',
            winner: null,
            isGameOver: false
        };

        this.setupGame();
    }

    private setupGame(): void {
        this.app.stage.addChild(this.board);
        this.board.position.set(0, 0);

        this.board.on('cell-click', this.handlePlayerMove.bind(this));
    }

    private handlePlayerMove(pos: Position): void {
        if (this.state.isGameOver || this.state.currentPlayer !== 'black') {
            return;
        }

        if (this.makeMove(pos)) {
            if (!this.state.isGameOver) {
                this.switchPlayer();
                this.makeAIMove();
            }
        }
    }

    private makeMove(pos: Position): boolean {
        if (!this.board.placeStone(pos, this.state.currentPlayer)) {
            return false;
        }

        const winner = this.board.checkWin(pos);
        if (winner) {
            this.state.winner = winner;
            this.state.isGameOver = true;
            this.handleGameOver();
        }

        return true;
    }

    private makeAIMove(): void {
        setTimeout(() => {
            const aiMove = this.ai.getNextMove(this.board.getBoard(), this.state.currentPlayer);
            if (this.makeMove(aiMove)) {
                if (!this.state.isGameOver) {
                    this.switchPlayer();
                }
            }
        }, 500);  // 添加延迟使 AI 走棋更自然
    }

    private switchPlayer(): void {
        this.state.currentPlayer = this.state.currentPlayer === 'black' ? 'white' : 'black';
    }

    private handleGameOver(): void {
        const message = this.state.winner === 'black' ? '黑棋获胜！' : '白棋获胜！';
        console.log(message);
        // 这里可以添加游戏结束的视觉效果
    }

    public restart(): void {
        this.board.reset();
        this.state = {
            board: Array(this.config.boardSize).fill(null)
                .map(() => Array(this.config.boardSize).fill(null)),
            currentPlayer: 'black',
            winner: null,
            isGameOver: false
        };
    }
} 