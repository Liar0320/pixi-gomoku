import { test, expect } from '@playwright/test';

test.describe('Game Basic Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should start a new game', async ({ page }) => {
    // 验证棋盘是否正确显示
    await expect(page.locator('#game-board')).toBeVisible();
    
    // 验证初始状态
    const stones = await page.locator('.stone').count();
    expect(stones).toBe(0);
  });

  test('should place stone correctly', async ({ page }) => {
    // 点击棋盘中心位置
    await page.locator('#game-board').click({
      position: { x: 225, y: 225 }, // 假设棋盘大小为 450x450，点击中心位置
    });

    // 验证是否成功放置棋子
    const stones = await page.locator('.stone').count();
    expect(stones).toBe(1);
  });

  test('should detect win condition', async ({ page }) => {
    // 模拟玩家连续下五子
    const positions = [
      { x: 75, y: 75 },   // (2, 2)
      { x: 75, y: 115 },  // (2, 3)
      { x: 75, y: 155 },  // (2, 4)
      { x: 75, y: 195 },  // (2, 5)
      { x: 75, y: 235 },  // (2, 6)
    ];

    for (const pos of positions) {
      await page.locator('#game-board').click({ position: pos });
      // 等待 AI 落子
      await page.waitForTimeout(500);
    }

    // 验证胜利提示
    await expect(page.locator('#win-message')).toBeVisible();
  });

  test('should play sound effects', async ({ page }) => {
    // 验证音效按钮存在
    await expect(page.locator('#sound-toggle')).toBeVisible();

    // 点击棋盘，验证是否触发音效
    await page.locator('#game-board').click({
      position: { x: 225, y: 225 },
    });

    // 注意：由于浏览器策略，无法直接验证音频播放，
    // 我们可以检查音频元素的状态
    const stoneAudio = page.locator('#stone-place-audio');
    await expect(stoneAudio).toHaveAttribute('src', '/stone-place.mp3');
  });

  test('should show animations', async ({ page }) => {
    // 点击棋盘
    await page.locator('#game-board').click({
      position: { x: 225, y: 225 },
    });

    // 验证动画类是否被添加
    const stone = page.locator('.stone').first();
    await expect(stone).toHaveClass(/animate/);
  });
}); 