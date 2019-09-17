class RiddimBoxTransportProvider {
  constructor(Transport) {
    this.transport = Transport;
    this.loopLength = 4;

    this.transport.on("beat", beats => {
      if (beats % this.loopLength === 0) {
        this.transport.provider.emit("loop");
      }
    });
  }

  on(event, handler) {
    this.transport.on(event, handler);
  }
}

export default RiddimBoxTransportProvider;
