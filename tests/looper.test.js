import { Looper, ToneMediaRecorderProvider } from "../src";

let micInput;
let Tone;
let MediaRecorder;
describe("Looper", () => {
  beforeEach(() => {
    micInput = {
      connect() {}
    };

    Tone = {
      context: {
        createMediaStreamDestination() {
          return {
            stream: {}
          };
        }
      }
    };

    MediaRecorder = () => ({});
  });

  afterEach(() => {
    Looper.mediaRecorderProvider = null;
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
});
