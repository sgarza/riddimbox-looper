import { constants } from "../../src";
import { constants as transportConstants } from "@riddimbox/transport";

const { MIN_LOOP_LENGTH } = constants;
const { PPQN } = transportConstants;

export const createLoopWithLengthOf = (beats, Looper, transportProvider) => {
  Looper.selectCurrentLoop();

  if (beats > MIN_LOOP_LENGTH) {
    const times = beats / MIN_LOOP_LENGTH;

    for (let index = 1; index < times; index++) {
      Looper.increaseCurrentLoopLength();
    }
  }

  for (let index = 0; index < PPQN * beats; index++) {
    transportProvider._tickHandler();
  }
  Looper.mediaRecorderProvider._createBufferCallback({ data: [1, 0] });
};

export const playbackBeats = (beats, transportProvider) => {
  for (let index = 0; index < PPQN * beats; index++) {
    transportProvider._tickHandler();
  }
};
