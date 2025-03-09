import * as PIXI from 'pixi.js';
import type { BoardState, CellState, GameConfig, Player, Position, WinInfo } from '../types';

export class Board extends PIXI.Container {
    private board: BoardState;
    private config: GameConfig;
    private graphics: PIXI.Graphics;
    private stones: PIXI.Container;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.board = this.createEmptyBoard();
        this.graphics = new PIXI.Graphics();
        this.stones = new PIXI.Container();
        
        this.addChild(this.graphics);
        this.addChild(this.stones);
        
        this.drawBoard();
        this.setupInteraction();
    }

    private createEmptyBoard(): BoardState {
        return Array(this.config.boardSize).fill(null)
            .map(() => Array(this.config.boardSize).fill(null));
    }

    private drawBoard(): void {
        const { boardSize, cellSize, backgroundColor, lineColor } = this.config;
        const boardWidth = boardSize * cellSize;
        
        // Draw background
        this.graphics.beginFill(backgroundColor);
        this.graphics.drawRect(0, 0, boardWidth, boardWidth);
        this.graphics.endFill();

        // Draw grid lines
        this.graphics.lineStyle(1, lineColor);
        
        // Vertical lines
        for (let i = 0; i <= boardSize; i++) {
            this.graphics.moveTo(i * cellSize, 0);
            this.graphics.lineTo(i * cellSize, boardWidth);
        }
        
        // Horizontal lines
        for (let i = 0; i <= boardSize; i++) {
            this.graphics.moveTo(0, i * cellSize);
            this.graphics.lineTo(boardWidth, i * cellSize);
        }
    }

    private setupInteraction(): void {
        this.interactive = true;
        this.on('pointerdown', this.handleClick.bind(this));
    }

    private handleClick(event: PIXI.FederatedPointerEvent): void {
        const position = this.getBoardPosition(event.global.x, event.global.y);
        if (this.isValidPosition(position)) {
            this.emit('cell-click', position);
        }
    }

    private getBoardPosition(x: number, y: number): Position {
        const localPos = this.toLocal({ x, y });
        return {
            x: Math.floor(localPos.x / this.config.cellSize),
            y: Math.floor(localPos.y / this.config.cellSize)
        };
    }

    private isValidPosition(pos: Position): boolean {
        return pos.x >= 0 && pos.x < this.config.boardSize &&
               pos.y >= 0 && pos.y < this.config.boardSize &&
               this.board[pos.y][pos.x] === null;
    }

    public placeStone(pos: Position, player: Player): PIXI.Graphics | false {
        if (!this.isValidPosition(pos)) {
            return false;
        }

        this.board[pos.y][pos.x] = player;
        return this.drawStone(pos, player);
    }

    private drawStone(pos: Position, player: Player): PIXI.Graphics {
        const stone = new PIXI.Graphics();
        const { cellSize, blackStoneColor, whiteStoneColor } = this.config;
        const radius = cellSize * 0.4;

        stone.beginFill(player === 'black' ? blackStoneColor : whiteStoneColor);
        stone.drawCircle(0, 0, radius);
        stone.endFill();

        stone.x = (pos.x + 0.5) * cellSize;
        stone.y = (pos.y + 0.5) * cellSize;

        this.stones.addChild(stone);
        return stone;
    }

    public checkWin(lastMove: Position): WinInfo | null {
        const directions = [
            [[0, 1], [0, -1]],   // vertical
            [[1, 0], [-1, 0]],   // horizontal
            [[1, 1], [-1, -1]],  // diagonal
            [[1, -1], [-1, 1]]   // anti-diagonal
        ];

        const player = this.board[lastMove.y][lastMove.x];
        if (!player) return null;

        for (const [dir1, dir2] of directions) {
            let count = 1;
            const line = {
                start: { ...lastMove },
                end: { ...lastMove }
            };

            // 计算一个方向的连续棋子
            let stones1 = this.countStonesWithEnd(lastMove, dir1, player, line.end);
            // 计算相反方向的连续棋子
            let stones2 = this.countStonesWithEnd(lastMove, dir2, player, line.start);
            
            count += stones1 + stones2;

            if (count >= 5) {
                // 调整起点和终点的位置到棋盘格子中心
                const { cellSize } = this.config;
                return {
                    player,
                    line: {
                        start: {
                            x: (line.start.x + 0.5) * cellSize,
                            y: (line.start.y + 0.5) * cellSize
                        },
                        end: {
                            x: (line.end.x + 0.5) * cellSize,
                            y: (line.end.y + 0.5) * cellSize
                        }
                    }
                };
            }
        }

        return null;
    }

    private countStonesWithEnd(
        start: Position,
        direction: number[],
        player: Player,
        endPos: Position
    ): number {
        let count = 0;
        let x = start.x + direction[0];
        let y = start.y + direction[1];

        while (
            x >= 0 && x < this.config.boardSize &&
            y >= 0 && y < this.config.boardSize &&
            this.board[y][x] === player
        ) {
            count++;
            endPos.x = x;
            endPos.y = y;
            x += direction[0];
            y += direction[1];
        }

        return count;
    }

    public getBoard(): BoardState {
        return this.board;
    }

    public reset(): void {
        this.board = this.createEmptyBoard();
        this.stones.removeChildren();
    }
} 