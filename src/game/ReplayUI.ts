import { GameRecord } from '../types';
import { GameRecorder } from './GameRecorder';
import { GameReplay } from './GameReplay';
import { Game } from './Game';

export class ReplayUI {
    private container: HTMLElement;
    private recordList!: HTMLElement;
    private controlPanel!: HTMLElement;
    private currentReplay: GameReplay | null;
    private game: Game;

    constructor(container: HTMLElement, game: Game) {
        this.container = container;
        this.game = game;
        this.currentReplay = null;
        this.setupUI();
    }

    private setupUI(): void {
        // 创建主容器
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '20px';
        wrapper.style.display = 'flex';
        wrapper.style.gap = '20px';
        wrapper.style.padding = '20px';
        wrapper.style.backgroundColor = '#f5f5f5';
        wrapper.style.borderRadius = '8px';

        // 创建历史记录列表
        this.recordList = document.createElement('div');
        this.recordList.style.flex = '1';
        this.recordList.style.maxHeight = '300px';
        this.recordList.style.overflowY = 'auto';
        this.recordList.style.padding = '10px';
        this.recordList.style.backgroundColor = 'white';
        this.recordList.style.borderRadius = '4px';

        // 创建控制面板
        this.controlPanel = document.createElement('div');
        this.controlPanel.style.flex = '1';
        this.controlPanel.style.padding = '10px';
        this.controlPanel.style.backgroundColor = 'white';
        this.controlPanel.style.borderRadius = '4px';
        this.controlPanel.style.display = 'none';

        wrapper.appendChild(this.recordList);
        wrapper.appendChild(this.controlPanel);
        this.container.appendChild(wrapper);

        this.updateRecordList();
    }

    private updateRecordList(): void {
        const records = GameRecorder.loadAllRecords();
        this.recordList.innerHTML = '<h3>历史对局</h3>';

        if (records.length === 0) {
            this.recordList.innerHTML += '<p>暂无对局记录</p>';
            return;
        }

        records.reverse().forEach(record => {
            const recordElement = document.createElement('div');
            recordElement.className = 'record-item';
            recordElement.style.padding = '10px';
            recordElement.style.margin = '5px 0';
            recordElement.style.backgroundColor = '#f9f9f9';
            recordElement.style.borderRadius = '4px';
            recordElement.style.cursor = 'pointer';

            recordElement.innerHTML = `
                <div>日期：${GameRecorder.formatDate(record.date)}</div>
                <div>时长：${GameRecorder.formatDuration(record.duration)}</div>
                <div>胜者：${record.winner === 'black' ? '黑棋' : '白棋'}</div>
                <div>步数：${record.moves.length}</div>
            `;

            recordElement.addEventListener('click', () => this.startReplay(record));
            this.recordList.appendChild(recordElement);
        });
    }

    private startReplay(record: GameRecord): void {
        this.game.restart();
        this.currentReplay = new GameReplay(this.game, record);
        this.setupControlPanel();
    }

    private setupControlPanel(): void {
        if (!this.currentReplay) return;

        this.controlPanel.style.display = 'block';
        this.controlPanel.innerHTML = `
            <h3>回放控制</h3>
            <div style="margin: 10px 0;">
                <button id="play-pause">播放</button>
                <button id="reset">重置</button>
                <button id="step-prev">上一步</button>
                <button id="step-next">下一步</button>
            </div>
            <div style="margin: 10px 0;">
                <label>速度：</label>
                <select id="speed-control">
                    <option value="2000">0.5x</option>
                    <option value="1000" selected>1x</option>
                    <option value="500">2x</option>
                    <option value="250">4x</option>
                </select>
            </div>
            <div style="margin: 10px 0;">
                <input type="range" id="progress-slider" min="0" 
                       max="${this.currentReplay.getTotalMoves()}" 
                       value="${this.currentReplay.getCurrentMove()}"
                       style="width: 100%;">
                <div id="progress-text">
                    步数：${this.currentReplay.getCurrentMove()} / ${this.currentReplay.getTotalMoves()}
                </div>
            </div>
        `;

        this.setupControlListeners();
    }

    private setupControlListeners(): void {
        if (!this.currentReplay) return;

        const playPauseBtn = document.getElementById('play-pause');
        const resetBtn = document.getElementById('reset');
        const stepPrevBtn = document.getElementById('step-prev');
        const stepNextBtn = document.getElementById('step-next');
        const speedControl = document.getElementById('speed-control') as HTMLSelectElement;
        const progressSlider = document.getElementById('progress-slider') as HTMLInputElement;
        const progressText = document.getElementById('progress-text');

        if (playPauseBtn) {
            playPauseBtn.onclick = () => {
                if (this.currentReplay?.isPlaying()) {
                    this.currentReplay.pause();
                    playPauseBtn.textContent = '播放';
                } else {
                    this.currentReplay?.start();
                    playPauseBtn.textContent = '暂停';
                }
            };
        }

        if (resetBtn) {
            resetBtn.onclick = () => {
                this.currentReplay?.reset();
                if (playPauseBtn) playPauseBtn.textContent = '播放';
                if (progressSlider) progressSlider.value = '0';
                if (progressText) {
                    progressText.textContent = `步数：0 / ${this.currentReplay?.getTotalMoves()}`;
                }
            };
        }

        if (stepPrevBtn) {
            stepPrevBtn.onclick = () => {
                const currentMove = this.currentReplay?.getCurrentMove() || 0;
                if (currentMove > 0) {
                    this.currentReplay?.jumpTo(currentMove - 1);
                    this.updateProgress();
                }
            };
        }

        if (stepNextBtn) {
            stepNextBtn.onclick = () => {
                const currentMove = this.currentReplay?.getCurrentMove() || 0;
                const totalMoves = this.currentReplay?.getTotalMoves() || 0;
                if (currentMove < totalMoves) {
                    this.currentReplay?.jumpTo(currentMove + 1);
                    this.updateProgress();
                }
            };
        }

        if (speedControl) {
            speedControl.onchange = () => {
                this.currentReplay?.setSpeed(Number(speedControl.value));
            };
        }

        if (progressSlider) {
            progressSlider.oninput = () => {
                this.currentReplay?.jumpTo(Number(progressSlider.value));
                this.updateProgress();
            };
        }

        // 定期更新进度
        setInterval(() => this.updateProgress(), 100);
    }

    private updateProgress(): void {
        if (!this.currentReplay) return;

        const progressSlider = document.getElementById('progress-slider') as HTMLInputElement;
        const progressText = document.getElementById('progress-text');
        const currentMove = this.currentReplay.getCurrentMove();
        const totalMoves = this.currentReplay.getTotalMoves();

        if (progressSlider) {
            progressSlider.value = currentMove.toString();
        }

        if (progressText) {
            progressText.textContent = `步数：${currentMove} / ${totalMoves}`;
        }
    }
} 