class TonePlayerProvider {
  constructor(Tone) {
    this.engine = Tone;
    this.player = null;
  }

  createPlayerFromBuffer(buffer) {
    this.player = new this.engine.Player(buffer);
  }

  connect(output) {
    this.player.connect(output);
  }
}

export default TonePlayerProvider;
