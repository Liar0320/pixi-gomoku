export type Player = 'black' | 'white';

export type CellState = Player | null;

export type Position = {
    x: number;
    y: number;
};

export type BoardState = CellState[][];

export interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | null;
    isGameOver: boolean;
}

export type GameConfig = {
    boardSize: number;
    cellSize: number;
    backgroundColor: number;
    lineColor: number;
    blackStoneColor: number;
    whiteStoneColor: number;
}; 