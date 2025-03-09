import * as PIXI from 'pixi.js';
import type { Position } from '../types';

export class Animation {
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public async playStoneAnimation(stone: PIXI.Graphics, position: Position): Promise<void> {
        // 初始化石头的缩放和透明度
        stone.scale.set(0.1);
        stone.alpha = 0;

        // 创建一个 Promise 来等待动画完成
        return new Promise((resolve) => {
            // 使用 PIXI.Ticker 创建动画
            let progress = 0;
            const animate = () => {
                progress += 0.1;
                
                // 缩放和透明度动画
                stone.scale.set(Math.min(1, 0.1 + progress * 0.9));
                stone.alpha = Math.min(1, progress);

                if (progress >= 1) {
                    this.app.ticker.remove(animate);
                    resolve();
                }
            };

            this.app.ticker.add(animate);
        });
    }

    public async playWinningLineAnimation(startPos: Position, endPos: Position): Promise<void> {
        const line = new PIXI.Graphics();
        this.app.stage.addChild(line);

        // 创建一个 Promise 来等待动画完成
        return new Promise((resolve) => {
            let progress = 0;
            const animate = () => {
                progress += 0.05;
                
                line.clear();
                line.lineStyle(3, 0xFF0000);
                line.moveTo(startPos.x, startPos.y);
                line.lineTo(
                    startPos.x + (endPos.x - startPos.x) * progress,
                    startPos.y + (endPos.y - startPos.y) * progress
                );

                if (progress >= 1) {
                    this.app.ticker.remove(animate);
                    // 添加闪烁效果
                    this.playBlinkAnimation(line).then(() => resolve());
                }
            };

            this.app.ticker.add(animate);
        });
    }

    private async playBlinkAnimation(target: PIXI.DisplayObject): Promise<void> {
        return new Promise((resolve) => {
            let blinkCount = 0;
            const maxBlinks = 3;
            let increasing = false;
            
            const animate = () => {
                if (increasing) {
                    target.alpha += 0.1;
                    if (target.alpha >= 1) {
                        increasing = false;
                        blinkCount++;
                    }
                } else {
                    target.alpha -= 0.1;
                    if (target.alpha <= 0) {
                        increasing = true;
                    }
                }

                if (blinkCount >= maxBlinks) {
                    this.app.ticker.remove(animate);
                    resolve();
                }
            };

            this.app.ticker.add(animate);
        });
    }

    public async playHighlightAnimation(position: Position): Promise<void> {
        const highlight = new PIXI.Graphics();
        this.app.stage.addChild(highlight);

        highlight.beginFill(0xFFFF00, 0.3);
        highlight.drawCircle(position.x, position.y, 20);
        highlight.endFill();

        return this.playBlinkAnimation(highlight).then(() => {
            this.app.stage.removeChild(highlight);
        });
    }
} 