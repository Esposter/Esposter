import type { Compression } from "#src/models/Compression";
import type { Encoding } from "#src/models/Encoding";

// The tile data of one layer or chunk as the document wrote it: either an encoded text, or one `<tile>` element per
// Cell in the form Tiled deprecated. `chunked` is set when the data holds chunks, which take the cells instead
export interface TMXDataSource {
  chunked: boolean;
  compression?: Compression;
  encoding?: Encoding;
  gids: number[];
  text: string;
}
