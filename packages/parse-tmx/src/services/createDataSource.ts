import type { Compression } from "#src/models/Compression";
import type { Encoding } from "#src/models/Encoding";
import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";

// A data source holds the cells of one data element, read in the compression and encoding that element wrote
export const createDataSource = (
  compression: Compression | undefined,
  encoding: Encoding | undefined,
): TMXDataSource => ({ chunked: false, compression, encoding, gids: [], text: "" });
