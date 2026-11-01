import type { BankReader } from "#src/models/genshinAssets/music/BankReader";

import { SOURCE_LENGTH } from "#src/services/genshinAssets/music/constants";

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
