import { STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import sharp from "sharp";

// The detail read at twice the structure's width, where a stone's carving and its courses still show
const DETAIL_WIDTH = STRUCTURE_WIDTH * 2;
// What a pixel keeps above its surroundings' blur is its detail, and its detail is compared averaged over a patch
const DETAIL_BLUR_SIGMA = 2;
const ENERGY_BLUR_SIGMA = 6;
// An image's detail energy: how far each pixel's grey strays from its surroundings, averaged over a patch
const readDetailEnergy = async (input: Buffer, height: number): Promise<Float32Array> => {
  const grey = sharp(input).resize(DETAIL_WIDTH, height, { fit: "fill" }).greyscale();
  const [{ data: sharpData }, { data: blurredData }] = await Promise.all([
    grey.clone().raw().toBuffer({ resolveWithObject: true }),
    grey.clone().blur(DETAIL_BLUR_SIGMA).raw().toBuffer({ resolveWithObject: true }),
  ]);
  const detail = Buffer.from(sharpData.map((value, index) => Math.abs(value - (blurredData[index] ?? 0))));
  const { data } = await sharp(detail, { raw: { channels: 1, height, width: DETAIL_WIDTH } })
    .blur(ENERGY_BLUR_SIGMA)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float32Array.from(data);
};
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
