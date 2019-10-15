/**
 * @riddimbox/looper v0.0.1
 * RiddimBox Looper module
 *
 * @author Sergio de la Garza
 * @license MIT
 * @preserve
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.RiddimBox = {}));
}(this, function (exports) { 'use strict';

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
      key: "increaseCurrentLoopLength",
      value: function increaseCurrentLoopLength() {
        Looper.transportProvider.increaseCurrentLoopLength();
        Looper.mediaRecorderProvider.currentLoopLength = Looper.currentLoopLength;
      }
    }, {
      key: "decreaseCurrentLoopLength",
      value: function decreaseCurrentLoopLength() {
        Looper.transportProvider.decreaseCurrentLoopLength();
        Looper.mediaRecorderProvider.currentLoopLength = Looper.currentLoopLength;
      }
    }, {
      key: "playbackLoops",
      value: function playbackLoops(_ref) {
        var totalBeats = _ref.totalBeats;
        var startTimeOffset = Looper.mediaRecorderProvider.ticksToTime;
        Looper.loops.filter(function (loop) {
          return totalBeats % loop.length === 0;
        }).forEach(function (loop) {
          return loop.player.start(Looper.mediaRecorderProvider.currentTime, startTimeOffset);
        });
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
        Looper.transportProvider.on("start", Looper.startRecording);
        Looper.transportProvider.on("stop", Looper.stopRecording);
        Looper.transportProvider.on("loop", Looper.restartRecording);
        Looper.transportProvider.on("beat", Looper.playbackLoops);
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

        return Looper._transportProvider;
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
      key: "currentLoopLength",
      get: function get() {
        return Looper.transportProvider.currentLoopLength;
      }
    }, {
      key: "input",
      set: function set(input) {
        Looper.mediaRecorderProvider.input = input;
      }
    }, {
      key: "output",
      set: function set(output) {
        Looper.mediaRecorderProvider.output = output;
      }
    }]);

    return Looper;
  }();

  _defineProperty(Looper, "_mediaRecorderProvider", null);

  _defineProperty(Looper, "_transportProvider", null);

  var constants = {
    MEDIA_RECORDER_RECORDING: "recording",
    MEDIA_RECORDER_INACTIVE: "inactive",
    MIN_LOOP_LENGTH: 4,
    MAX_LOOP_LENGTH: 64,
    DEFAULT_TICKS_TO_TIME_VALUE: 25
  };

  var PPQN = constants.PPQN,
      MIN_LOOP_LENGTH = constants.MIN_LOOP_LENGTH;

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
      this.currentLoopLength = MIN_LOOP_LENGTH;
      this.loops = [];
      this._output = Tone.Master;

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
        player.connect(this._output);
        var startTimeOffset = this.ticksToTime;
        player.start(this.currentTime, startTimeOffset);
        this.loops.push({
          length: this.currentLoopLength,
          player: player
        });
      }
    }, {
      key: "ticksToTime",
      get: function get() {
        var bpm = this.engine.Transport.bpm;
        return bpm.ticksToTime(this.engine.Transport.ticks % PPQN);
      }
    }, {
      key: "currentTime",
      get: function get() {
        return this.engine.context.currentTime;
      }
    }, {
      key: "input",
      set: function set(input) {
        input.connect(this.recorderStreamDestination);
      }
    }, {
      key: "output",
      set: function set(output) {
        var _this2 = this;

        this.loops.forEach(function (loop) {
          loop.player.disconnect(_this2._output);
          loop.player.connect(output);
        });
        this._output = output;
      }
    }]);

    return ToneMediaRecorderProvider;
  }();

  var MIN_LOOP_LENGTH$1 = constants.MIN_LOOP_LENGTH,
      MAX_LOOP_LENGTH = constants.MAX_LOOP_LENGTH;

  var RiddimBoxTransportProvider =
  /*#__PURE__*/
  function () {
    function RiddimBoxTransportProvider(Transport) {
      var _this = this;

      _classCallCheck(this, RiddimBoxTransportProvider);

      this.transport = Transport;
      this.currentLoopLength = MIN_LOOP_LENGTH$1;
      this.transport.on("beat", function (_ref) {
        var beats = _ref.beats;

        if (beats % _this.currentLoopLength === 0) {
          _this.transport.provider.emit("loop");
        }
      });
    }

    _createClass(RiddimBoxTransportProvider, [{
      key: "on",
      value: function on(event, handler) {
        this.transport.on(event, handler);
      }
    }, {
      key: "increaseCurrentLoopLength",
      value: function increaseCurrentLoopLength() {
        var length = this.currentLoopLength + MIN_LOOP_LENGTH$1;

        if (length > MAX_LOOP_LENGTH) {
          length = MIN_LOOP_LENGTH$1;
        }

        this.currentLoopLength = length;
      }
    }, {
      key: "decreaseCurrentLoopLength",
      value: function decreaseCurrentLoopLength() {
        var length = this.currentLoopLength - MIN_LOOP_LENGTH$1;

        if (length < MIN_LOOP_LENGTH$1) {
          length = MAX_LOOP_LENGTH;
        }

        this.currentLoopLength = length;
      }
    }]);

    return RiddimBoxTransportProvider;
  }();

  exports.Looper = Looper;
  exports.RiddimBoxTransportProvider = RiddimBoxTransportProvider;
  exports.ToneMediaRecorderProvider = ToneMediaRecorderProvider;
  exports.constants = constants;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.bundle.js.map
