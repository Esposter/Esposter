import { HOSTED_BROTLI_EXTENSIONS } from "#src/services/hostedAssets/constants";
import { promisify } from "node:util";
import { brotliCompress } from "node:zlib";

const compress = promisify(brotliCompress);

// An object's stored bytes and the Content-Encoding they are stored with. The hash is taken over the bytes given here,
// So a reader that decodes the encoding gets the bytes the name hashes
export const encodeHostedAssetObject = async (
  extension: string,
  bytes: Uint8Array,
): Promise<{ body: Uint8Array; contentEncoding?: string | undefined }> =>
  HOSTED_BROTLI_EXTENSIONS.has(extension)
    ? { body: await compress(bytes), contentEncoding: "br" }
    : { body: bytes, contentEncoding: undefined };
