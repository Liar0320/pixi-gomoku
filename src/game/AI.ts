import type { BoardState, Player, Position } from '../types';

export class AI {
    private boardSize: number;

    constructor(boardSize: number) {
        this.boardSize = boardSize;
    }

    public getNextMove(board: BoardState, player: Player): Position {
        // 首先尝试找到获胜位置
        const winningMove = this.findWinningMove(board, player);
        if (winningMove) {
            return winningMove;
        }

        // 其次尝试阻止对手获胜
        const opponent = player === 'black' ? 'white' : 'black';
        const blockingMove = this.findWinningMove(board, opponent);
        if (blockingMove) {
            return blockingMove;
        }

        // 如果没有紧急情况，评估每个可能的位置
        return this.findBestMove(board, player);
    }

    private findWinningMove(board: BoardState, player: Player): Position | null {
        const emptyPositions = this.getEmptyPositions(board);
        
        for (const pos of emptyPositions) {
            if (this.wouldWin(board, pos, player)) {
                return pos;
            }
        }

        return null;
    }

    private findBestMove(board: BoardState, player: Player): Position {
        const emptyPositions = this.getEmptyPositions(board);
        let bestScore = -Infinity;
        let bestMove = emptyPositions[0];

        for (const pos of emptyPositions) {
            const score = this.evaluatePosition(board, pos, player);
            if (score > bestScore) {
                bestScore = score;
                bestMove = pos;
            }
        }

        return bestMove;
    }

    private evaluatePosition(board: BoardState, pos: Position, player: Player): number {
        let score = 0;
        const directions = [
            [[0, 1], [0, -1]],   // vertical
            [[1, 0], [-1, 0]],   // horizontal
            [[1, 1], [-1, -1]],  // diagonal
            [[1, -1], [-1, 1]]   // anti-diagonal
        ];

        // 模拟在该位置落子
        const tempBoard = board.map(row => [...row]);
        tempBoard[pos.y][pos.x] = player;

        for (const [dir1, dir2] of directions) {
            const line = this.getLine(tempBoard, pos, dir1, dir2);
            score += this.evaluateLine(line, player);
        }

        return score;
    }

    private getLine(board: BoardState, pos: Position, dir1: number[], dir2: number[]): (Player | null)[] {
        const line: (Player | null)[] = [board[pos.y][pos.x]];
        
        // 向两个方向扩展
        for (const dir of [dir1, dir2]) {
            let x = pos.x + dir[0];
            let y = pos.y + dir[1];
            let count = 0;

            while (
                x >= 0 && x < this.boardSize &&
                y >= 0 && y < this.boardSize &&
                count < 4
            ) {
                line.push(board[y][x]);
                x += dir[0];
                y += dir[1];
                count++;
            }
        }

        return line;
    }

    private evaluateLine(line: (Player | null)[], player: Player): number {
        const opponent = player === 'black' ? 'white' : 'black';
        let score = 0;

        // 连续棋子数量的评分
        const playerCount = line.filter(cell => cell === player).length;
        const opponentCount = line.filter(cell => cell === opponent).length;
        const emptyCount = line.filter(cell => cell === null).length;

        if (playerCount === 4 && emptyCount === 1) score += 1000;  // 快要赢了
        else if (playerCount === 3 && emptyCount === 2) score += 100;  // 三连
        else if (playerCount === 2 && emptyCount === 3) score += 10;   // 二连
        
        if (opponentCount === 4 && emptyCount === 1) score += 900;  // 阻止对手赢
        else if (opponentCount === 3 && emptyCount === 2) score += 90;  // 阻止对手三连

        return score;
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

    private wouldWin(board: BoardState, pos: Position, player: Player): boolean {
        const directions = [
            [[0, 1], [0, -1]],   // vertical
            [[1, 0], [-1, 0]],   // horizontal
            [[1, 1], [-1, -1]],  // diagonal
            [[1, -1], [-1, 1]]   // anti-diagonal
        ];

        // 模拟在该位置落子
        const tempBoard = board.map(row => [...row]);
        tempBoard[pos.y][pos.x] = player;

        for (const [dir1, dir2] of directions) {
            let count = 1;  // 当前位置的棋子
            count += this.countInDirection(tempBoard, pos, dir1, player);
            count += this.countInDirection(tempBoard, pos, dir2, player);

            if (count >= 5) return true;
        }

        return false;
    }

    private countInDirection(board: BoardState, start: Position, direction: number[], player: Player): number {
        let count = 0;
        let x = start.x + direction[0];
        let y = start.y + direction[1];

        while (
            x >= 0 && x < this.boardSize &&
            y >= 0 && y < this.boardSize &&
            board[y][x] === player
        ) {
            count++;
            x += direction[0];
            y += direction[1];
        }

        return count;
    }
} 