export class Sound {
    private sounds: Map<string, HTMLAudioElement>;
    private isMuted: boolean;

    constructor() {
        this.sounds = new Map();
        this.isMuted = false;
        this.initSounds();
    }

    private initSounds(): void {
        // 初始化音效
        this.loadSound('place', '/stone-place.mp3');
        this.loadSound('win', '/win.mp3');
        this.loadSound('background', '/background.mp3', true);
    }

    private loadSound(name: string, url: string, loop: boolean = false): void {
        try {
            const audio = new Audio(url);
            audio.loop = loop;
            // 预加载音频
            audio.load();
            // 设置音量
            audio.volume = name === 'background' ? 0.3 : 0.5;
            this.sounds.set(name, audio);
            console.log(`Loaded sound: ${name}`);
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }

    public async playSound(name: string): Promise<void> {
        if (this.isMuted) return;

        const sound = this.sounds.get(name);
        if (sound) {
            try {
                // 如果音频正在播放，先重置
                if (!sound.paused) {
                    sound.currentTime = 0;
                } else {
                    await sound.play();
                }
            } catch (error) {
                console.error(`Error playing sound ${name}:`, error);
            }
        } else {
            console.warn(`Sound not found: ${name}`);
        }
    }

    public toggleMute(): void {
        this.isMuted = !this.isMuted;
        this.sounds.forEach(sound => {
            if (this.isMuted) {
                sound.pause();
            } else if (sound.loop) {
                // 只恢复循环播放的音频（背景音乐）
                sound.play().catch(error => {
                    console.error('Error resuming background music:', error);
                });
            }
        });
    }

    public stopAll(): void {
        this.sounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }

    public setVolume(name: string, volume: number): void {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.volume = Math.max(0, Math.min(1, volume));
        }
    }
} 