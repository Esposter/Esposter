import { BankReader } from "#src/models/genshinAssets/music/BankReader";

export const readProperties = (reader: BankReader): Map<number, number> => {
  const ids = Array.from({ length: reader.readUInt8() }, () => reader.readUInt8());
  return new Map(ids.map((id) => [id, reader.readFloat()]));
};
