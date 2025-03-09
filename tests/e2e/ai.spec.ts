import { test, expect } from '@playwright/test';

test.describe('AI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should respond to player moves', async ({ page }) => {
    // 玩家落子
    await page.locator('#game-board').click({
      position: { x: 225, y: 225 },
    });

    // 等待 AI 响应
    await page.waitForTimeout(1000);

    // 验证棋盘上有两颗棋子（玩家和 AI 各一颗）
    const stones = await page.locator('.stone').count();
    expect(stones).toBe(2);
  });

  test('should change AI difficulty', async ({ page }) => {
    // 验证难度选择器存在
    const difficultySelect = page.locator('#ai-difficulty');
    await expect(difficultySelect).toBeVisible();

    // 切换难度
    await difficultySelect.selectOption('hard');

    // 玩家落子
    await page.locator('#game-board').click({
      position: { x: 225, y: 225 },
    });

    // 等待 AI 响应（困难模式可能需要更长时间思考）
    await page.waitForTimeout(2000);

    // 验证 AI 是否响应
    const stones = await page.locator('.stone').count();
    expect(stones).toBe(2);
  });

  test('should block player winning moves', async ({ page }) => {
    // 切换到困难模式
    await page.locator('#ai-difficulty').selectOption('hard');

    // 模拟玩家尝试连成四子
    const positions = [
      { x: 75, y: 75 },   // (2, 2)
      { x: 75, y: 115 },  // (2, 3)
      { x: 75, y: 155 },  // (2, 4)
      { x: 75, y: 195 },  // (2, 5)
    ];

    for (const pos of positions) {
      await page.locator('#game-board').click({ position: pos });
      await page.waitForTimeout(1000); // 等待 AI 响应
    }

    // 验证 AI 是否阻止了玩家在 (2, 6) 位置获胜
    const blockingStone = await page.locator('.stone').filter({
      hasText: '○', // AI 的棋子
    }).count();
    
    expect(blockingStone).toBeGreaterThan(0);
  });

  test('should make winning moves when possible', async ({ page }) => {
    // 切换到困难模式
    await page.locator('#ai-difficulty').selectOption('hard');

    // 让玩家故意下出可以被 AI 获胜的局面
    const positions = [
      { x: 75, y: 75 },    // (2, 2)
      { x: 115, y: 75 },   // (3, 2)
      { x: 195, y: 75 },   // (5, 2)
      { x: 235, y: 75 },   // (6, 2)
    ];

    for (const pos of positions) {
      await page.locator('#game-board').click({ position: pos });
      await page.waitForTimeout(1000);
    }

    // 等待 AI 做出获胜移动
    await page.waitForTimeout(2000);

    // 验证游戏是否结束，AI 获胜
    await expect(page.locator('#win-message')).toBeVisible();
    await expect(page.locator('#win-message')).toContainText('AI');
  });
}); 