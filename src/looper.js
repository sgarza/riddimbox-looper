class Looper {
  static _mediaRecorderProvider = null;

  static get mediaRecorderProvider() {
    Looper._throwIfMediaRecorderProvderNotSet();
    return Looper._mediaRecorderProvider;
  }

  static set mediaRecorderProvider(mediaRecorderProvider) {
    Looper._mediaRecorderProvider = mediaRecorderProvider;
  }

  static set input(input) {
    Looper.mediaRecorderProvider.input = input;
  }

  static _throwIfMediaRecorderProvderNotSet() {
    if (!Looper._mediaRecorderProvider) {
      throw new Error(
        "You need to set a MediaRecorderProvider first, try with ToneMediaRecorderProvider class."
      );
    }
  }
}

export default Looper;
