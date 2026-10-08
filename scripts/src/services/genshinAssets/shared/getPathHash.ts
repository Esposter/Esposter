import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { createHash } from "node:crypto";

// The name AnimeStudio exports an asset under, given its path: MD5 over the path and its type's suffix, zero padded to
// The next 256 bytes, of which the first five bytes read little-endian are the asset's 40-bit path hash. The name is
// That hash without its low byte (PathHashLast) in hex, so `Data/_ExcelBinOutput/QuestExcelConfigData` is `3b87ae83`
// (RinoPaw/Genshin-Reverse's `mihoyo_name_hash`, checked against the installed asset index)
export const getPathHash = (path: string): string => {
  const raw = Buffer.from(`${path}.${AssetType.MiHoYoBinData}`, "ascii");
  const padded = Buffer.alloc(((raw.length >> 8) + 1) << 8);
  raw.copy(padded);
  const digest = createHash("md5").update(padded).digest();
  return digest.readUInt32LE(1).toString(16).padStart(8, "0");
};
