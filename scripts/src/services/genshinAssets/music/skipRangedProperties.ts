import { BankReader } from "#src/models/genshinAssets/music/BankReader";

export const skipRangedProperties = (reader: BankReader): void => {
  const count = reader.readUInt8();
  reader.skip(count + count * 8);
};
