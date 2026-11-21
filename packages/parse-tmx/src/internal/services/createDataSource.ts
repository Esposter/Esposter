import type { Compression } from "#src/internal/models/Compression";
import type { Encoding } from "#src/internal/models/Encoding";
import type { TMXDataSource } from "#src/internal/models/tmx/TMXDataSource";

// A data source holds the cells of one data element, read in the compression and encoding that element wrote
export const createDataSource = (
  compression: Compression | undefined,
  encoding: Encoding | undefined,
): TMXDataSource => ({ chunked: false, compression, encoding, gids: [], text: "" });
