import { Compression } from "#src/models/Compression";
import { InvalidOperationError, Operation } from "@esposter/shared";

// `Uint8Array<ArrayBuffer>` rather than a bare `Uint8Array`: `BodyInit` accepts a view over a real
// `ArrayBuffer`, not one over the `ArrayBufferLike` a bare `Uint8Array` widens to, so `new Response(bytes)`
// Does not typecheck against the looser parameter. Every caller reaches this through `Uint8Array.fromBase64`,
// Which already returns the narrower type.
export const getDecompressedBytes: (
  bytes: Uint8Array<ArrayBuffer>,
  compression: Compression.Gzip | Compression.Zlib,
) => Promise<Uint8Array<ArrayBuffer>> = async (bytes, compression) => {
  const format = compression === Compression.Gzip ? "gzip" : "deflate";
  const compressedTileStream = new Response(bytes).body;
  if (!compressedTileStream) throw new InvalidOperationError(Operation.Read, getDecompressedBytes.name, compression);

  const decompressedTileStream = compressedTileStream.pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(decompressedTileStream).arrayBuffer());
};
