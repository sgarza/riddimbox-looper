import { constants } from "../../src";
import { constants as transportConstants } from "@riddimbox/transport";

const { MIN_LOOP_LENGTH } = constants;
const { PPQN } = transportConstants;

export const createLoopWithLengthOf = (
  lengthInBeats,
  Looper,
  transportProvider
) => {
  Looper.selectCurrentLoop();

  if (lengthInBeats > MIN_LOOP_LENGTH) {
    const times = lengthInBeats / MIN_LOOP_LENGTH;

    for (let index = 1; index < times; index++) {
      Looper.increaseCurrentLoopLength();
    }
  }

  for (let index = 0; index < PPQN * lengthInBeats; index++) {
    transportProvider._tickHandler();
  }
  Looper.mediaRecorderProvider._createBufferCallback({ data: [1, 0] });
};

export const playbackFor = (lengthInBeats, transportProvider) => {
  for (let index = 0; index < PPQN * lengthInBeats; index++) {
    transportProvider._tickHandler();
  }
};
