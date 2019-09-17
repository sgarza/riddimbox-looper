class RiddimBoxTransportProvider {
  constructor(Transport) {
    this.transport = Transport;
  }

  on(event, handler) {
    this.transport.on(event, handler);
  }
}

export default RiddimBoxTransportProvider;
