class ToneMediaRecorderProvider {
  constructor(Tone, MediaRecorder) {
    this.engine = Tone;
    this.MediaRecorder = MediaRecorder;
    this.recorderStreamDestination = null;
    this.recorder = null;

    this._setupMediaRecorder();
  }

  set input(input) {
    input.connect(this.recorderStreamDestination);
  }

  _setupMediaRecorder() {
    this.recorderStreamDestination = this.engine.context.createMediaStreamDestination();
    this.recorder = new this.MediaRecorder(
      this.recorderStreamDestination.stream
    );
  }
}

export default ToneMediaRecorderProvider;
