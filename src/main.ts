import { Game } from './game/Game'

// 初始化游戏
const gameContainer = document.getElementById('game-container') as HTMLElement
const game = new Game(gameContainer)

// 添加重新开始按钮功能
const restartButton = document.getElementById('restart-button')
if (restartButton) {
    restartButton.addEventListener('click', () => {
        game.restart()
    })
}
