import { Compression } from "@/models/Compression";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getDecompressedBytes: (
  bytes: Uint8Array,
  compression: Compression.Gzip | Compression.Zlib,
) => Promise<Uint8Array> = async (bytes, compression) => {
  const format = compression === Compression.Gzip ? "gzip" : "deflate";
  const compressedTileStream = new Response(bytes).body;
  if (!compressedTileStream) throw new InvalidOperationError(Operation.Read, getDecompressedBytes.name, compression);

  const decompressedTileStream = compressedTileStream.pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(decompressedTileStream).arrayBuffer());
};
