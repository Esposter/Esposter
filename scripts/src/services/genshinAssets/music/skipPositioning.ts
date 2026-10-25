import { BankReader } from "#src/models/genshinAssets/music/BankReader";

export const skipPositioning = (reader: BankReader): void => {
  const bits = reader.readUInt8();
  const isOverridingParent = Boolean(bits & 1);
  const isThreeDimensional = Boolean((bits >> 1) & 1);
  const positionType = (bits >> 5) & 3;
  if (!isOverridingParent || !isThreeDimensional) return;
  reader.skip(1);
  if (positionType === 0) return;
  // A path's mode and transition time, its vertices, then its play list's items and each item's ranges
  reader.skip(5);
  reader.skip(reader.readUInt32() * 16);
  const itemCount = reader.readUInt32();
  reader.skip(itemCount * 8 + itemCount * 12);
};
