export type Player = 'black' | 'white';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AIConfig = {
    difficulty: Difficulty;
    maxDepth: number;
    useCache: boolean;
};

export type CellState = Player | null;

export type Position = {
    x: number;
    y: number;
};

export type Line = {
    start: Position;
    end: Position;
};

export type WinInfo = {
    player: Player;
    line: Line;
};

export type Move = {
    position: Position;
    player: Player;
    timestamp: number;
};

export type GameRecord = {
    id: string;
    date: string;
    moves: Move[];
    winner: Player | null;
    duration: number;
};

export type BoardState = CellState[][];

export interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | null;
    isGameOver: boolean;
    moves: Move[];
    startTime: number;
}

export type GameConfig = {
    boardSize: number;
    cellSize: number;
    backgroundColor: number;
    lineColor: number;
    blackStoneColor: number;
    whiteStoneColor: number;
};

export type ReplayControl = {
    isPlaying: boolean;
    currentMove: number;
    speed: number;
}; 