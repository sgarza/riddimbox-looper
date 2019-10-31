import { Player, TonePlayerProvider } from "../src";

let Tone = {
  context: {
    createMediaStreamDestination() {
      return {
        stream: {}
      };
    },
    currentTime: 1
  },
  Transport: {},
  Buffer: jest.fn(),
  Player: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn()
  })),
  Master: {}
};
let buffer = [0, 0, 0, 1];

describe("Player", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("When the provider is not set", () => {
    const player = new Player(buffer);
    it("should throw if no provider is set", () => {
      expect(player.connect).toThrow(
        "You need to set a PlayerProvider first, try with TonePlayerProvider class."
      );

      expect(player.start).toThrow(
        "You need to set a PlayerProvider first, try with TonePlayerProvider class."
      );
    });
  });

  describe("When the provider is set", () => {
    const player = new Player(buffer);
    const provider = new TonePlayerProvider(Tone);
    player.provider = provider;

    it("should connect the player to an output", () => {
      const output = jest.fn();

      expect(() => {
        player.connect(output);
      }).not.toThrow();

      expect(provider.player.connect).toHaveBeenCalledTimes(1);
    });
  });
});
