export class SoundManager {
  private readonly eatSound = new Audio('/assets/sounds/eat.mp3');
  private readonly hitSound = new Audio('/assets/sounds/hit.mp3');
  public muted = localStorage.getItem('cybersnake_muted') === 'true';
  constructor() { this.eatSound.volume = 0.45; this.hitSound.volume = 0.55; }
  public playEat() { this.play(this.eatSound); }
  public playHit() { this.play(this.hitSound); }
  public toggle() { this.muted = !this.muted; localStorage.setItem('cybersnake_muted', String(this.muted)); return this.muted; }
  private play(source: HTMLAudioElement) {
    if (this.muted) return;
    const sound = source.cloneNode(true) as HTMLAudioElement;
    sound.volume = source.volume;
    void sound.play().catch(() => undefined);
  }
}
