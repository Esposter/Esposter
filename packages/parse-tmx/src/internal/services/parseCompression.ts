import { Compression } from "#src/internal/models/Compression";
import { parseEnumAttribute } from "#src/internal/services/parseEnumAttribute";

// Zstandard is the one Tiled compression the enum leaves out, since no browser ships a decompressor for it
export const parseCompression = (value: string | undefined): Compression | undefined =>
  parseEnumAttribute(parseCompression.name, "compression", Compression, value);
