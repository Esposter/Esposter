import { DETAIL_WIDTH } from "#src/services/genshinParity/reference/constants";
import { readDetailEnergy } from "#src/services/genshinParity/reference/readDetailEnergy";
import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

// How far a shot's detail strays from a reference's, as the mean difference of their detail energy in percent of the
// Largest a pixel can hold: what the tone blurs away, so a textureless stone of the right colour still scores its loss.
// Given a layer, a mask at the structure's width, it is read over the layer's pixels alone
export const scoreDetail = async (reference: Buffer, shot: Buffer, layer?: Uint8Array): Promise<number> => {
  const { height: referenceHeight, width: referenceWidth } = await sharp(reference).metadata();
  const height = Math.round((DETAIL_WIDTH / referenceWidth) * referenceHeight);
  const [referenceEnergy, shotEnergy] = await Promise.all([
    readDetailEnergy(reference, height),
    readDetailEnergy(shot, height),
  ]);
  const layerScale = STRUCTURE_WIDTH / DETAIL_WIDTH;
  let sum = 0;
  let count = 0;
  for (const [index, energy] of referenceEnergy.entries()) {
    const layerIndex =
      Math.floor(Math.floor(index / DETAIL_WIDTH) * layerScale) * STRUCTURE_WIDTH +
      Math.floor((index % DETAIL_WIDTH) * layerScale);
    if (layer && !layer[layerIndex]) continue;
    sum += Math.abs(energy - (shotEnergy[index] ?? 0));
    count++;
  }
  return (sum / Math.max(count, 1) / BYTE) * 100;
};
