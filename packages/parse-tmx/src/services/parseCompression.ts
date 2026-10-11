import { Compression } from "#src/models/Compression";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Zstandard is the one Tiled compression this reader does not decode, since no browser ships a decompressor for it
export const parseCompression = (value: string | undefined): Compression | undefined => {
  if (value === undefined) return undefined;
  if (value === Compression.Gzip) return Compression.Gzip;
  else if (value === Compression.Zlib) return Compression.Zlib;
  throw new InvalidOperationError(Operation.Read, parseCompression.name, `${value} is not a supported compression`);
};
