import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { WhiteBalance } from "genshin-engine";

import { clampWhiteBalance } from "#src/services/genshinParity/display/clampWhiteBalance";
import { UNDER_BLACK_BAND_COUNT } from "#src/services/genshinParity/display/constants";
import { readUnderBlackShares } from "#src/services/genshinParity/display/readUnderBlackShares";
import { minimizeNelderMead } from "#src/services/genshinParity/shared/minimizeNelderMead";
import { computeWhiteBalance } from "genshin-engine";
import { Matrix3 } from "three";

// The refinement's first step and how many steps it takes, which bring a temperature and a tint to a tenth
const BALANCE_STEP = 10;
const BALANCE_ITERATION_COUNT = 40;
// An hour's white balance (`computeWhiteBalance`) solved by what its stone shows under the tone curve's black: under
// Each candidate the light is solved again over every reference's stone, and the balance is the one whose light takes
// The same share of the stone's pixels under the black, channel by channel, as each reference shows in each band of
// How bright it shows their green, refined from the balance given. The black is where the balance alone shows, a channel no light that cannot fall below none reaches
export const solveUnderBlackBalance = async (
  references: readonly (readonly StoneLightSample[])[],
  start: WhiteBalance,
): Promise<{ cost: number; whiteBalance: WhiteBalance }> => {
  const whiteBalance = new Matrix3();
  const { cost, point } = await minimizeNelderMead(
    (candidate) =>
      Promise.resolve(
        readUnderBlackShares(
          references,
          computeWhiteBalance(clampWhiteBalance(candidate), whiteBalance),
          UNDER_BLACK_BAND_COUNT,
        )
          .flat()
          .reduce(
            (sum, { ours, reference }) =>
              sum +
              ours.reduce((channelSum, share, channel) => channelSum + (share - (reference[channel] ?? 0)) ** 2, 0),
            0,
          ),
      ),
    [start.temperature, start.tint],
    [BALANCE_STEP, BALANCE_STEP],
    BALANCE_ITERATION_COUNT,
  );
  return { cost, whiteBalance: clampWhiteBalance(point) };
};
