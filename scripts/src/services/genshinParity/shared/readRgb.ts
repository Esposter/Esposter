import { readRawRgb } from "#src/services/genshinParity/shared/readRawRgb";
import { BYTE } from "#src/services/shared/constants";

export const readRgb = async (input: Buffer, width: number, height: number): Promise<Float32Array> => {
  const data = await readRawRgb(input, width, height);
  return Float32Array.from(data, (value) => value / BYTE);
};
