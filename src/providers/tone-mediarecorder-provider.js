import constants from "../constants";
const { PPQN, MIN_LOOP_LENGTH } = constants;

class ToneMediaRecorderProvider {
  constructor(Tone, MediaRecorder) {
    this.engine = Tone;
    this.MediaRecorder = MediaRecorder;
    this.recorderStreamDestination = null;
    this.recorder = null;
    this.selectCurrentLoop = false;
    this.currentLoopLength = MIN_LOOP_LENGTH;
    this.loops = [];
    this._output = Tone.Master;

    this._setupMediaRecorder();
  }

  get ticksToTime() {
    const { bpm } = this.engine.Transport;
    return bpm.ticksToTime(this.engine.Transport.ticks % PPQN);
  }

  get currentTime() {
    return this.engine.context.currentTime;
  }

  set input(input) {
    input.connect(this.recorderStreamDestination);
  }

  set output(output) {
    this.loops.forEach(loop => {
      loop.player.disconnect(this._output);
      loop.player.connect(output);
    });

    this._output = output;
  }

  startRecording() {
    this.recorder.start();
  }

  stopRecording() {
    this.recorder.stop();
  }

  _setupMediaRecorder() {
    this.recorderStreamDestination = this.engine.context.createMediaStreamDestination();
    this.recorder = new this.MediaRecorder(
      this.recorderStreamDestination.stream
    );

    this.recorder.ondataavailable = this._onDataAvailableHandler;
  }

  _onDataAvailableHandler(e) {
    if (!this.selectCurrentLoop) return;

    this.selectCurrentLoop = false;

    const blob = new Blob([e.data], {
      type: "audio/webm;; codec=opus"
    });

    const url = URL.createObjectURL(blob);

    const buffer = new this.engine.Buffer(url, () => {
      this._createBufferCallback(buffer);
    });
  }

  _createBufferCallback(buffer) {
    const player = new this.engine.Player(buffer);

    player.connect(this._output);

    const startTimeOffset = this.ticksToTime;

    player.start(this.currentTime, startTimeOffset);

    this.loops.push({
      length: this.currentLoopLength,
      enabled: true,
      player
    });
  }
}

export default ToneMediaRecorderProvider;
