class ToneMediaRecorderProvider {
  constructor(Tone, MediaRecorder) {
    this.engine = Tone;
    this.MediaRecorder = MediaRecorder;
    this.recorderStreamDestination = null;
    this.recorder = null;
    this.selectCurrentLoop = false;
    this.loops = [];

    this._setupMediaRecorder();
  }

  set input(input) {
    input.connect(this.recorderStreamDestination);
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

    this.loops.push({
      player
    });
  }
}

export default ToneMediaRecorderProvider;
