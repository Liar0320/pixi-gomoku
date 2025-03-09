import type { BoardState, Player, Position } from '../types';

export class MinimaxAI {
    private boardSize: number;
    private maxDepth: number;
    private evaluationCache: Map<string, number>;

    constructor(boardSize: number, maxDepth: number = 3) {
        this.boardSize = boardSize;
        this.maxDepth = maxDepth;
        this.evaluationCache = new Map();
    }

    public getNextMove(board: BoardState, player: Player): Position {
        const emptyPositions = this.getEmptyPositions(board);
        let bestScore = -Infinity;
        let bestMove = emptyPositions[0];

        // Alpha-Beta 剪枝的初始值
        const alpha = -Infinity;
        const beta = Infinity;

        for (const pos of emptyPositions) {
            const newBoard = this.makeMove(board, pos, player);
            const score = this.minimax(newBoard, this.maxDepth, false, player, alpha, beta);

            if (score > bestScore) {
                bestScore = score;
                bestMove = pos;
            }
        }

        return bestMove;
    }

    private minimax(
        board: BoardState,
        depth: number,
        isMaximizing: boolean,
        player: Player,
        alpha: number,
        beta: number
    ): number {
        // 生成棋盘状态的唯一键
        const boardKey = this.getBoardKey(board, depth, isMaximizing);
        if (this.evaluationCache.has(boardKey)) {
            return this.evaluationCache.get(boardKey)!;
        }

        // 终止条件
        if (depth === 0 || this.isGameOver(board)) {
            const score = this.evaluateBoard(board, player);
            this.evaluationCache.set(boardKey, score);
            return score;
        }

        const emptyPositions = this.getEmptyPositions(board);
        const currentPlayer = isMaximizing ? player : this.getOpponent(player);

        let bestScore = isMaximizing ? -Infinity : Infinity;
        let currentAlpha = alpha;
        let currentBeta = beta;

        for (const pos of emptyPositions) {
            const newBoard = this.makeMove(board, pos, currentPlayer);
            const score = this.minimax(
                newBoard,
                depth - 1,
                !isMaximizing,
                player,
                currentAlpha,
                currentBeta
            );

            if (isMaximizing) {
                bestScore = Math.max(bestScore, score);
                currentAlpha = Math.max(currentAlpha, bestScore);
            } else {
                bestScore = Math.min(bestScore, score);
                currentBeta = Math.min(currentBeta, bestScore);
            }

            // Alpha-Beta 剪枝
            if (currentBeta <= currentAlpha) {
                break;
            }
        }

        this.evaluationCache.set(boardKey, bestScore);
        return bestScore;
    }

    private evaluateBoard(board: BoardState, player: Player): number {
        let score = 0;

        // 评估所有可能的五子连线
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                score += this.evaluatePosition(board, { x, y }, player);
            }
        }

        return score;
    }

    private evaluatePosition(board: BoardState, pos: Position, player: Player): number {
        const directions = [
            [1, 0],  // 水平
            [0, 1],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];

        let totalScore = 0;

        for (const [dx, dy] of directions) {
            totalScore += this.evaluateLine(board, pos, dx, dy, player);
        }

        return totalScore;
    }

    private evaluateLine(
        board: BoardState,
        start: Position,
        dx: number,
        dy: number,
        player: Player
    ): number {
        const opponent = this.getOpponent(player);
        const line: (Player | null)[] = [];

        // 获取连续5个位置的棋子
        for (let i = 0; i < 5; i++) {
            const x = start.x + dx * i;
            const y = start.y + dy * i;

            if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) {
                return 0;
            }

            line.push(board[y][x]);
        }

        // 计算分数
        const playerCount = line.filter(cell => cell === player).length;
        const opponentCount = line.filter(cell => cell === opponent).length;
        const emptyCount = line.filter(cell => cell === null).length;

        // 如果同时包含双方的棋子，这条线没有威胁
        if (playerCount > 0 && opponentCount > 0) {
            return 0;
        }

        // 计算分数
        if (playerCount === 5) return 100000;     // 获胜
        if (playerCount === 4 && emptyCount === 1) return 10000;   // 活四
        if (playerCount === 3 && emptyCount === 2) return 1000;    // 活三
        if (playerCount === 2 && emptyCount === 3) return 100;     // 活二
        if (playerCount === 1 && emptyCount === 4) return 10;      // 活一

        if (opponentCount === 4 && emptyCount === 1) return 5000;  // 防守对手的活四
        if (opponentCount === 3 && emptyCount === 2) return 500;   // 防守对手的活三

        return 0;
    }

    private getOpponent(player: Player): Player {
        return player === 'black' ? 'white' : 'black';
    }

    private makeMove(board: BoardState, pos: Position, player: Player): BoardState {
        const newBoard = board.map(row => [...row]);
        newBoard[pos.y][pos.x] = player;
        return newBoard;
    }

    private getEmptyPositions(board: BoardState): Position[] {
        const positions: Position[] = [];
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (board[y][x] === null) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }

    private isGameOver(board: BoardState): boolean {
        // 检查是否有人获胜
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const player = board[y][x];
                if (player && this.checkWin(board, { x, y })) {
                    return true;
                }
            }
        }

        // 检查是否还有空位
        return this.getEmptyPositions(board).length === 0;
    }

    private checkWin(board: BoardState, pos: Position): boolean {
        const directions = [
            [1, 0],  // 水平
            [0, 1],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];

        const player = board[pos.y][pos.x];
        if (!player) return false;

        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 向一个方向数
            count += this.countInDirection(board, pos, dx, dy, player);
            // 向相反方向数
            count += this.countInDirection(board, pos, -dx, -dy, player);

            if (count >= 5) return true;
        }

        return false;
    }

    private countInDirection(
        board: BoardState,
        start: Position,
        dx: number,
        dy: number,
        player: Player
    ): number {
        let count = 0;
        let x = start.x + dx;
        let y = start.y + dy;

        while (
            x >= 0 && x < this.boardSize &&
            y >= 0 && y < this.boardSize &&
            board[y][x] === player
        ) {
            count++;
            x += dx;
            y += dy;
        }

        return count;
    }

    private getBoardKey(board: BoardState, depth: number, isMaximizing: boolean): string {
        return `${board.map(row => row.join('')).join('')}-${depth}-${isMaximizing}`;
    }

    public getBoardSize(): number {
        return this.boardSize;
    }
} 