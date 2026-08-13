class AudioNotifier {
  private audioCtx: AudioContext | null = null;
  public enabled: boolean = false;

  private init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playBuyChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.1); // A6
    
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.5);
  }

  playExitBuzz() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const playBuzz = (startTime: number) => {
      const osc = this.audioCtx!.createOscillator();
      const gainNode = this.audioCtx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, startTime); // A2
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    };

    playBuzz(this.audioCtx.currentTime);
    playBuzz(this.audioCtx.currentTime + 0.3);
  }
}

export const audioNotifier = new AudioNotifier();
