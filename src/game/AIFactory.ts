import type { AIConfig, BoardState, Difficulty, Player, Position } from '../types';
import { MinimaxAI } from './MinimaxAI';

export class AIFactory {
    private static readonly CONFIG: Record<Difficulty, AIConfig> = {
        easy: {
            difficulty: 'easy',
            maxDepth: 2,
            useCache: false
        },
        medium: {
            difficulty: 'medium',
            maxDepth: 3,
            useCache: true
        },
        hard: {
            difficulty: 'hard',
            maxDepth: 4,
            useCache: true
        }
    };

    private ai: MinimaxAI;
    private config: AIConfig;

    constructor(boardSize: number, difficulty: Difficulty = 'medium') {
        this.config = AIFactory.CONFIG[difficulty];
        this.ai = new MinimaxAI(boardSize, this.config.maxDepth);
    }

    public getNextMove(board: BoardState, player: Player): Position {
        return this.ai.getNextMove(board, player);
    }

    public setDifficulty(difficulty: Difficulty): void {
        if (this.config.difficulty !== difficulty) {
            this.config = AIFactory.CONFIG[difficulty];
            this.ai = new MinimaxAI(this.ai.getBoardSize(), this.config.maxDepth);
        }
    }

    public getDifficulty(): Difficulty {
        return this.config.difficulty;
    }
} 