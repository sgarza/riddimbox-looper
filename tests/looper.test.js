import "./url.mock";
import {
  Looper,
  ToneMediaRecorderProvider,
  RiddimBoxTransportProvider,
  constants
} from "../src";

import {
  Transport,
  ToneTransportProvider,
  constants as transportConstants
} from "@riddimbox/transport";

import { createLoopWithLengthOf, playbackFor } from "./helpers";

const {
  MEDIA_RECORDER_RECORDING,
  MEDIA_RECORDER_INACTIVE,
  DEFAULT_TICKS_TO_TIME_VALUE
} = constants;

const {
  TRANSPORT_STARTED,
  TRANSPORT_STOPPED,
  DEFAULT_BPM_VALUE,
  DEFAULT_SWING_VALUE,
  DEFAULT_SWING_SUBDIVISION_VALUE,
  DEFAULT_TIME_SIGNATURE_VALUE,
  PPQN
} = transportConstants;

let micInput;
let Tone;
let MediaRecorder;
let mockToneTransport;
let recorderInstance;
let toneTransportProvider;

describe("Looper", () => {
  beforeEach(() => {
    micInput = {
      connect() {}
    };

    mockToneTransport = {
      start: () => {
        Tone.Transport.state = TRANSPORT_STARTED;
      },
      stop: () => {
        Tone.Transport.state = TRANSPORT_STOPPED;
      },
      state: TRANSPORT_STOPPED,
      bpm: {
        value: DEFAULT_BPM_VALUE,
        ticksToTime: jest
          .fn()
          .mockImplementation(() => DEFAULT_TICKS_TO_TIME_VALUE)
      },
      swing: DEFAULT_SWING_VALUE,
      swingSubdivision: DEFAULT_SWING_SUBDIVISION_VALUE,
      timeSignature: DEFAULT_TIME_SIGNATURE_VALUE,
      scheduleRepeat: () => {}
    };

    Tone = {
      context: {
        createMediaStreamDestination() {
          return {
            stream: {}
          };
        },
        currentTime: 1
      },
      Transport: { ...mockToneTransport },
      Buffer: jest.fn(),
      Player: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        start: jest.fn()
      })),
      Master: {}
    };

    recorderInstance = {
      state: MEDIA_RECORDER_INACTIVE,
      start() {
        recorderInstance.state = MEDIA_RECORDER_RECORDING;
      },
      stop() {
        recorderInstance.state = MEDIA_RECORDER_INACTIVE;
      }
    };
    MediaRecorder = () => recorderInstance;

    toneTransportProvider = new ToneTransportProvider(Tone);
    Transport.provider = toneTransportProvider;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when ToneMediaRecorderProvider is not set", () => {
    it("should throw when connecting the input", () => {
      const wrapper = () => {
        Looper.input = micInput;
      };

      expect(wrapper).toThrow(
        "You need to set a MediaRecorderProvider first, try with ToneMediaRecorderProvider class."
      );
    });
  });

  describe("when ToneMediaRecorderProvider is set", () => {
    it("should accept a media stream as its input", () => {
      jest.spyOn(micInput, "connect");

      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      Looper.mediaRecorderProvider = mediaRecorderProvider;

      const wrapper = () => {
        Looper.input = micInput;
      };

      expect(wrapper).not.toThrow();
      expect(micInput.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the Transport Provider is not set", () => {
    it("should throw when executing selectCurrentLoop", () => {
      jest.spyOn(micInput, "connect");

      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.input = micInput;

      const wrapper = () => {
        Looper.selectCurrentLoop();
      };

      expect(wrapper).toThrow(
        "You need to set a TransportProvider first, try with RiddimBoxTransportProvider class."
      );
    });
  });

  describe("when the Transport Provider is set", () => {
    it("should execute Looper.startRecording on Transport starts", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);

      jest.spyOn(Looper, "startRecording");
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      expect(Looper.startRecording).toHaveBeenCalledTimes(1);
    });

    it("should execute Looper.stopRecording when Transport stops", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);

      jest.spyOn(Looper, "stopRecording");
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();
      Transport.stop();

      expect(Looper.stopRecording).toHaveBeenCalledTimes(1);
    });

    it("should execute Looper.restartRecording on each 'loop'", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);

      jest.spyOn(Looper, "restartRecording");
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      playbackFor(5, toneTransportProvider);
      Looper.mediaRecorderProvider._onDataAvailableHandler({ data: [1, 0] });
      expect(Looper.restartRecording).toHaveBeenCalledTimes(1);
    });

    it("should save the the current loop when selectCurrentLoop is activated", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);

      jest.spyOn(Looper, "restartRecording");
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      Looper.selectCurrentLoop();
      playbackFor(5, toneTransportProvider);
      Looper.mediaRecorderProvider._onDataAvailableHandler({ data: [1, 0] });
      mediaRecorderProvider.engine.Buffer.mock.calls[0][1]();
      expect(Looper.restartRecording).toHaveBeenCalledTimes(1);
      expect(Tone.Buffer).toHaveBeenCalledTimes(1);
      expect(Tone.Player).toHaveBeenCalledTimes(1);
      expect(Looper.loops).toHaveLength(1);
    });

    it("should increase the lenght of the current loop by MIN_LOOP_LENGTH measures when #increaseCurrentLoopLength is executed", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      expect(Looper.currentLoopLength).toBe(4);

      Looper.increaseCurrentLoopLength();
      expect(Looper.currentLoopLength).toBe(8);
    });

    it("should cycle to MIN_LOOP_LENGTH when increasing and reaching MAX_LOOP_LENGTH", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      expect(Looper.currentLoopLength).toBe(4);

      for (let index = 0; index < 16; index++) {
        Looper.increaseCurrentLoopLength();
      }
      expect(Looper.currentLoopLength).toBe(4);
    });

    it("should decrease the lenght of the current loop by MIN_LOOP_LENGTH measures when #decreaseCurrentLoopLength is executed", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      expect(Looper.currentLoopLength).toBe(4);

      Looper.increaseCurrentLoopLength();
      Looper.decreaseCurrentLoopLength();
      expect(Looper.currentLoopLength).toBe(4);
    });

    it("should cycle to MAX_LOOP_LENGTH when decreasing and reaching MIN_LOOP_LENGTH", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      expect(Looper.currentLoopLength).toBe(4);

      Looper.decreaseCurrentLoopLength();
      expect(Looper.currentLoopLength).toBe(64);
    });

    it("should connect the looper output to the master output if no output is specified", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      createLoopWithLengthOf(4, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops).toHaveLength(1);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledTimes(1);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledWith(Tone.Master);
    });

    it("should connect the looper output to the specified audio node", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      const output = jest.fn();
      expect(() => {
        Looper.output = output;
      }).not.toThrow();

      Transport.start();

      createLoopWithLengthOf(4, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops).toHaveLength(1);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledTimes(1);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledWith(output);
    });

    it("should disconnect existing loops from previous output when specifying a new output", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      createLoopWithLengthOf(4, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops).toHaveLength(1);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledTimes(1);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledWith(Tone.Master);

      const output = jest.fn();
      expect(() => {
        Looper.output = output;
      }).not.toThrow();
      expect(
        mediaRecorderProvider.loops[0].player.disconnect
      ).toHaveBeenCalledTimes(1);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledTimes(2);
      expect(
        mediaRecorderProvider.loops[0].player.disconnect
      ).toHaveBeenCalledWith(Tone.Master);
      expect(
        mediaRecorderProvider.loops[0].player.connect
      ).toHaveBeenCalledWith(output);
    });

    it("should start playing the just saved loop", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      createLoopWithLengthOf(4, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
        1
      );
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledWith(
        Tone.context.currentTime,
        DEFAULT_TICKS_TO_TIME_VALUE
      );
    });

    it("should restart the saved loop in the correct beat (4 beats)", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      createLoopWithLengthOf(4, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
        1
      );

      playbackFor(4, toneTransportProvider);
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
        2
      );
    });

    it("should restart the saved loop in the correct beat (8 beats)", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      createLoopWithLengthOf(8, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
        1
      );

      playbackFor(8, toneTransportProvider);
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
        2
      );
    });

    it("should restart the saved loops in the correct beat (4 beats && 8 beats)", () => {
      const mediaRecorderProvider = new ToneMediaRecorderProvider(
        Tone,
        MediaRecorder
      );

      const transportProvider = new RiddimBoxTransportProvider(Transport);
      Looper.mediaRecorderProvider = mediaRecorderProvider;
      Looper.transportProvider = transportProvider;
      Looper.input = micInput;

      Transport.start();

      createLoopWithLengthOf(4, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
        1
      );

      createLoopWithLengthOf(8, Looper, toneTransportProvider);
      expect(mediaRecorderProvider.loops).toHaveLength(2);
      playbackFor(8, toneTransportProvider);
      expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
        5
      );
      expect(mediaRecorderProvider.loops[1].player.start).toHaveBeenCalledTimes(
        2
      );
    });
  });

  it("should prevent the playback of a loop if the loop is disabled", () => {
    const mediaRecorderProvider = new ToneMediaRecorderProvider(
      Tone,
      MediaRecorder
    );

    const transportProvider = new RiddimBoxTransportProvider(Transport);
    Looper.mediaRecorderProvider = mediaRecorderProvider;
    Looper.transportProvider = transportProvider;
    Looper.input = micInput;

    Transport.start();

    createLoopWithLengthOf(4, Looper, toneTransportProvider);
    createLoopWithLengthOf(4, Looper, toneTransportProvider);
    expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
      2
    );
    expect(mediaRecorderProvider.loops[1].player.start).toHaveBeenCalledTimes(
      1
    );

    Looper.disableLoopByIndex(0);
    playbackFor(4, toneTransportProvider);
    expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
      2
    );
    expect(mediaRecorderProvider.loops[1].player.start).toHaveBeenCalledTimes(
      2
    );
  });

  it("should enable the playback of a loop that was disabled", () => {
    const mediaRecorderProvider = new ToneMediaRecorderProvider(
      Tone,
      MediaRecorder
    );

    const transportProvider = new RiddimBoxTransportProvider(Transport);
    Looper.mediaRecorderProvider = mediaRecorderProvider;
    Looper.transportProvider = transportProvider;
    Looper.input = micInput;

    Transport.start();

    createLoopWithLengthOf(4, Looper, toneTransportProvider);
    expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
      1
    );

    Looper.disableLoopByIndex(0);
    playbackFor(4, toneTransportProvider);
    expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
      1
    );

    Looper.enableLoopByIndex(0);
    playbackFor(4, toneTransportProvider);
    expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
      2
    );
  });

  it("should delete a specific loop", () => {
    const mediaRecorderProvider = new ToneMediaRecorderProvider(
      Tone,
      MediaRecorder
    );

    const transportProvider = new RiddimBoxTransportProvider(Transport);
    Looper.mediaRecorderProvider = mediaRecorderProvider;
    Looper.transportProvider = transportProvider;
    Looper.input = micInput;

    Transport.start();

    createLoopWithLengthOf(4, Looper, toneTransportProvider);
    expect(mediaRecorderProvider.loops[0].player.start).toHaveBeenCalledTimes(
      1
    );

    Looper.deleteLoopByIndex(0);
    expect(mediaRecorderProvider.loops).toHaveLength(0);
  });
});
