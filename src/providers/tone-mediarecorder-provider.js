import {
  MEDIA_RECORDER_INACTIVE,
  MEDIA_RECORDER_RECORDING
} from "../constants";

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

  startRecording() {
    if (this.recorder.state === MEDIA_RECORDER_INACTIVE) {
      this.recorder.start();
    }
  }

  _setupMediaRecorder() {
    this.recorderStreamDestination = this.engine.context.createMediaStreamDestination();
    this.recorder = new this.MediaRecorder(
      this.recorderStreamDestination.stream
    );
  }
}

export default ToneMediaRecorderProvider;
