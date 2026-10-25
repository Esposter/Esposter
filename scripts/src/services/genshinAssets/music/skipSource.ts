import { BankReader } from "#src/models/genshinAssets/music/BankReader";

// A source's plugin, how it streams, its id, its size in memory and its bits
const SOURCE_LENGTH = 14;
// The type a source plugin's id carries in its low bits, whose parameters follow its source
const SOURCE_PLUGIN_TYPE = 2;

export const skipSource = (reader: BankReader): number => {
  const pluginId = reader.readUInt32();
  reader.skip(1);
  const sourceId = reader.readUInt32();
  reader.skip(SOURCE_LENGTH - 9);
  if ((pluginId & 0x0f) === SOURCE_PLUGIN_TYPE) reader.skip(reader.readUInt32());
  return sourceId;
};
