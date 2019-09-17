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

const { MEDIA_RECORDER_RECORDING, MEDIA_RECORDER_INACTIVE } = constants;

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
      bpm: { value: DEFAULT_BPM_VALUE },
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
        }
      },
      Transport: { ...mockToneTransport }
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
      const toneTransportProvider = new ToneTransportProvider(Tone);
      Transport.provider = toneTransportProvider;

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
      const toneTransportProvider = new ToneTransportProvider(Tone);
      Transport.provider = toneTransportProvider;

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
      const toneTransportProvider = new ToneTransportProvider(Tone);
      Transport.provider = toneTransportProvider;

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
      for (let index = 0; index < PPQN * 5; index++) {
        toneTransportProvider._tickHandler();
      }

      expect(Looper.restartRecording).toHaveBeenCalledTimes(1);
    });
  });
});
