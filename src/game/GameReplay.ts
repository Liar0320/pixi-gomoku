import type { GameRecord, Move, ReplayControl } from '../types';
import { Game } from './Game';

export class GameReplay {
    private game: Game;
    private record: GameRecord;
    private control: ReplayControl;
    private replayInterval: number | null;

    constructor(game: Game, record: GameRecord) {
        this.game = game;
        this.record = record;
        this.control = {
            isPlaying: false,
            currentMove: 0,
            speed: 1000 // 默认每步间隔 1 秒
        };
        this.replayInterval = null;
    }

    public start(): void {
        if (this.control.isPlaying) return;
        
        this.control.isPlaying = true;
        this.playNextMove();
    }

    public pause(): void {
        this.control.isPlaying = false;
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
            this.replayInterval = null;
        }
    }

    public reset(): void {
        this.pause();
        this.control.currentMove = 0;
        this.game.restart();
    }

    public setSpeed(speed: number): void {
        this.control.speed = speed;
        if (this.control.isPlaying) {
            this.pause();
            this.start();
        }
    }

    public jumpTo(moveIndex: number): void {
        this.pause();
        this.control.currentMove = 0;
        this.game.restart();

        // 重放到指定步骤
        for (let i = 0; i < moveIndex && i < this.record.moves.length; i++) {
            const move = this.record.moves[i];
            this.game.replayMove(move.position);
        }

        this.control.currentMove = moveIndex;
    }

    private playNextMove(): void {
        if (!this.control.isPlaying) return;

        if (this.control.currentMove >= this.record.moves.length) {
            this.pause();
            return;
        }

        const move = this.record.moves[this.control.currentMove];
        this.game.replayMove(move.position);
        this.control.currentMove++;

        this.replayInterval = window.setTimeout(
            () => this.playNextMove(),
            this.control.speed
        );
    }

    public getProgress(): number {
        return this.control.currentMove / this.record.moves.length;
    }

    public getCurrentMove(): number {
        return this.control.currentMove;
    }

    public getTotalMoves(): number {
        return this.record.moves.length;
    }

    public isPlaying(): boolean {
        return this.control.isPlaying;
    }
} 