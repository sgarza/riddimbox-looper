/**
 * @riddimbox/looper v0.0.1
 * RiddimBox Looper module
 *
 * @author Sergio de la Garza
 * @license MIT
 * @preserve
 */

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var Looper =
/*#__PURE__*/
function () {
  function Looper() {
    _classCallCheck(this, Looper);
  }

  _createClass(Looper, null, [{
    key: "startRecording",
    value: function startRecording() {
      Looper.mediaRecorderProvider.startRecording();
    }
  }, {
    key: "stopRecording",
    value: function stopRecording() {
      Looper.mediaRecorderProvider.stopRecording();
    }
  }, {
    key: "restartRecording",
    value: function restartRecording() {
      Looper.mediaRecorderProvider.stopRecording();
      Looper.mediaRecorderProvider.startRecording();
    }
  }, {
    key: "selectCurrentLoop",
    value: function selectCurrentLoop() {
      Looper._throwIfTransportProviderNotSet();

      Looper.mediaRecorderProvider.selectCurrentLoop = true;
    }
  }, {
    key: "_throwIfMediaRecorderProvderNotSet",
    value: function _throwIfMediaRecorderProvderNotSet() {
      if (!Looper._mediaRecorderProvider) {
        throw new Error("You need to set a MediaRecorderProvider first, try with ToneMediaRecorderProvider class.");
      }
    }
  }, {
    key: "_throwIfTransportProviderNotSet",
    value: function _throwIfTransportProviderNotSet() {
      if (!Looper._transportProvider) {
        throw new Error("You need to set a TransportProvider first, try with RiddimBoxTransportProvider class.");
      }
    }
  }, {
    key: "_setupTransportEvents",
    value: function _setupTransportEvents() {
      this.transportProvider.on("start", Looper.startRecording);
      this.transportProvider.on("stop", Looper.stopRecording);
      this.transportProvider.on("loop", Looper.restartRecording);
    }
  }, {
    key: "mediaRecorderProvider",
    get: function get() {
      Looper._throwIfMediaRecorderProvderNotSet();

      return Looper._mediaRecorderProvider;
    },
    set: function set(mediaRecorderProvider) {
      Looper._mediaRecorderProvider = mediaRecorderProvider;
    }
  }, {
    key: "transportProvider",
    get: function get() {
      Looper._throwIfTransportProviderNotSet();

      return this._transportProvider;
    },
    set: function set(transportProvider) {
      Looper._transportProvider = transportProvider;

      Looper._setupTransportEvents();
    }
  }, {
    key: "loops",
    get: function get() {
      return Looper.mediaRecorderProvider.loops;
    }
  }, {
    key: "input",
    set: function set(input) {
      Looper.mediaRecorderProvider.input = input;
    }
  }]);

  return Looper;
}();

_defineProperty(Looper, "_mediaRecorderProvider", null);

_defineProperty(Looper, "_transportProvider", null);

var ToneMediaRecorderProvider =
/*#__PURE__*/
function () {
  function ToneMediaRecorderProvider(Tone, MediaRecorder) {
    _classCallCheck(this, ToneMediaRecorderProvider);

    this.engine = Tone;
    this.MediaRecorder = MediaRecorder;
    this.recorderStreamDestination = null;
    this.recorder = null;
    this.selectCurrentLoop = false;
    this.loops = [];

    this._setupMediaRecorder();
  }

  _createClass(ToneMediaRecorderProvider, [{
    key: "startRecording",
    value: function startRecording() {
      this.recorder.start();
    }
  }, {
    key: "stopRecording",
    value: function stopRecording() {
      this.recorder.stop();
    }
  }, {
    key: "_setupMediaRecorder",
    value: function _setupMediaRecorder() {
      this.recorderStreamDestination = this.engine.context.createMediaStreamDestination();
      this.recorder = new this.MediaRecorder(this.recorderStreamDestination.stream);
      this.recorder.ondataavailable = this._onDataAvailableHandler;
    }
  }, {
    key: "_onDataAvailableHandler",
    value: function _onDataAvailableHandler(e) {
      var _this = this;

      if (!this.selectCurrentLoop) return;
      this.selectCurrentLoop = false;
      var blob = new Blob([e.data], {
        type: "audio/webm;; codec=opus"
      });
      var url = URL.createObjectURL(blob);
      var buffer = new this.engine.Buffer(url, function () {
        _this._createBufferCallback(buffer);
      });
    }
  }, {
    key: "_createBufferCallback",
    value: function _createBufferCallback(buffer) {
      var player = new this.engine.Player(buffer);
      this.loops.push({
        player: player
      });
    }
  }, {
    key: "input",
    set: function set(input) {
      input.connect(this.recorderStreamDestination);
    }
  }]);

  return ToneMediaRecorderProvider;
}();

var RiddimBoxTransportProvider =
/*#__PURE__*/
function () {
  function RiddimBoxTransportProvider(Transport) {
    var _this = this;

    _classCallCheck(this, RiddimBoxTransportProvider);

    this.transport = Transport;
    this.loopLength = 4;
    this.transport.on("beat", function (beats) {
      if (beats % _this.loopLength === 0) {
        _this.transport.provider.emit("loop");
      }
    });
  }

  _createClass(RiddimBoxTransportProvider, [{
    key: "on",
    value: function on(event, handler) {
      this.transport.on(event, handler);
    }
  }]);

  return RiddimBoxTransportProvider;
}();

var constants = {
  MEDIA_RECORDER_RECORDING: "recording",
  MEDIA_RECORDER_INACTIVE: "inactive"
};

export { Looper, RiddimBoxTransportProvider, ToneMediaRecorderProvider, constants };
//# sourceMappingURL=index.esm.bundle.js.map
