import type { BankReader } from "#src/models/genshinAssets/music/BankReader";

export const skipAuxiliary = (reader: BankReader): void => {
  if ((reader.readUInt8() >> 3) & 1) reader.skip(16);
};
