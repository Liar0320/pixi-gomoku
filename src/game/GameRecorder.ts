import type { GameRecord, Move, Player } from '../types';

export class GameRecorder {
    private static readonly STORAGE_KEY = 'gomoku_game_records';

    public static saveGame(moves: Move[], winner: Player | null, startTime: number): void {
        const gameRecord: GameRecord = {
            id: this.generateId(),
            date: new Date().toISOString(),
            moves,
            winner,
            duration: Date.now() - startTime
        };

        const records = this.loadAllRecords();
        records.push(gameRecord);
        
        // 只保留最近的 50 场游戏
        if (records.length > 50) {
            records.shift();
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    }

    public static loadAllRecords(): GameRecord[] {
        const recordsJson = localStorage.getItem(this.STORAGE_KEY);
        if (!recordsJson) {
            return [];
        }

        try {
            return JSON.parse(recordsJson);
        } catch (error) {
            console.error('Error loading game records:', error);
            return [];
        }
    }

    public static getRecord(id: string): GameRecord | null {
        const records = this.loadAllRecords();
        return records.find(record => record.id === id) || null;
    }

    public static deleteRecord(id: string): void {
        const records = this.loadAllRecords();
        const filteredRecords = records.filter(record => record.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecords));
    }

    public static clearAllRecords(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    private static generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    public static formatDuration(duration: number): string {
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    public static formatDate(date: string): string {
        return new Date(date).toLocaleString();
    }
} 