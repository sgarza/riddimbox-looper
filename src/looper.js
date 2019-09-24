class Looper {
  static _mediaRecorderProvider = null;
  static _transportProvider = null;

  static get mediaRecorderProvider() {
    Looper._throwIfMediaRecorderProvderNotSet();
    return Looper._mediaRecorderProvider;
  }

  static get transportProvider() {
    Looper._throwIfTransportProviderNotSet();
    return Looper._transportProvider;
  }

  static get loops() {
    return Looper.mediaRecorderProvider.loops;
  }

  static get currentLoopLength() {
    return Looper.transportProvider.currentLoopLength;
  }

  static set mediaRecorderProvider(mediaRecorderProvider) {
    Looper._mediaRecorderProvider = mediaRecorderProvider;
  }

  static set transportProvider(transportProvider) {
    Looper._transportProvider = transportProvider;

    Looper._setupTransportEvents();
  }

  static set input(input) {
    Looper.mediaRecorderProvider.input = input;
  }

  static set output(output) {
    Looper.mediaRecorderProvider.output = output;
  }

  static startRecording() {
    Looper.mediaRecorderProvider.startRecording();
  }

  static stopRecording() {
    Looper.mediaRecorderProvider.stopRecording();
  }

  static restartRecording() {
    Looper.mediaRecorderProvider.stopRecording();
    Looper.mediaRecorderProvider.startRecording();
  }

  static selectCurrentLoop() {
    Looper._throwIfTransportProviderNotSet();
    Looper.mediaRecorderProvider.selectCurrentLoop = true;
  }

  static increaseCurrentLoopLength() {
    Looper.transportProvider.increaseCurrentLoopLength();
  }

  static decreaseCurrentLoopLength() {
    Looper.transportProvider.decreaseCurrentLoopLength();
  }

  static _throwIfMediaRecorderProvderNotSet() {
    if (!Looper._mediaRecorderProvider) {
      throw new Error(
        "You need to set a MediaRecorderProvider first, try with ToneMediaRecorderProvider class."
      );
    }
  }

  static _throwIfTransportProviderNotSet() {
    if (!Looper._transportProvider) {
      throw new Error(
        "You need to set a TransportProvider first, try with RiddimBoxTransportProvider class."
      );
    }
  }

  static _setupTransportEvents() {
    Looper.transportProvider.on("start", Looper.startRecording);
    Looper.transportProvider.on("stop", Looper.stopRecording);
    Looper.transportProvider.on("loop", Looper.restartRecording);
  }
}

export default Looper;
