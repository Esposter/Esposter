import { BankReader } from "#src/models/genshinAssets/music/BankReader";

export const skipStateChunk = (reader: BankReader): void => {
  for (let index = reader.readVariableUInt(); index > 0; index--) {
    reader.readVariableUInt();
    reader.skip(2);
  }
  for (let index = reader.readVariableUInt(); index > 0; index--) {
    reader.skip(5);
    reader.skip(reader.readVariableUInt() * 8);
  }
};
