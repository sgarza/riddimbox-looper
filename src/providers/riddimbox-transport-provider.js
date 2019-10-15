import constants from "../constants";
const { MIN_LOOP_LENGTH, MAX_LOOP_LENGTH } = constants;

class RiddimBoxTransportProvider {
  constructor(Transport) {
    this.transport = Transport;
    this.currentLoopLength = MIN_LOOP_LENGTH;

    this.transport.on("beat", ({ beats }) => {
      if (beats % this.currentLoopLength === 0) {
        this.transport.provider.emit("loop");
      }
    });
  }

  on(event, handler) {
    this.transport.on(event, handler);
  }

  increaseCurrentLoopLength() {
    let length = this.currentLoopLength + MIN_LOOP_LENGTH;

    if (length > MAX_LOOP_LENGTH) {
      length = MIN_LOOP_LENGTH;
    }

    this.currentLoopLength = length;
  }

  decreaseCurrentLoopLength() {
    let length = this.currentLoopLength - MIN_LOOP_LENGTH;

    if (length < MIN_LOOP_LENGTH) {
      length = MAX_LOOP_LENGTH;
    }

    this.currentLoopLength = length;
  }
}

export default RiddimBoxTransportProvider;
