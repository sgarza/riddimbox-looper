class Player {
  constructor(buffer) {
    this.buffer = buffer;
    this._provider = null;
  }

  get provider() {
    if (!this._provider) {
      throw new Error(
        "You need to set a PlayerProvider first, try with TonePlayerProvider class."
      );
    }

    return this._provider;
  }

  set provider(provider) {
    this._provider = provider;
    provider.createPlayerFromBuffer(this.buffer);
  }

  connect = output => {
    this.provider.connect(output);
  };

  start = () => {
    this.provider.start();
  };
}

export default Player;
