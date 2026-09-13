import {
  DELTA_FLAG,
  DELTA_HEADER_BYTE_COUNT,
  HASH_BYTE_COUNT,
  KEYFRAME_FLAG,
  OBJECT_FLAGS_OFFSET,
  OBJECT_FORMAT_VERSION,
  OBJECT_HEADER_BYTE_COUNT,
  OBJECT_MAGIC,
  OBJECT_VERSION_OFFSET,
  OBJECT_WINDOW_LOG_OFFSET,
} from "#src/constants";
import { getWindowLog } from "#src/services/getWindowLog";
import { promisify } from "node:util";
import { constants, zstdCompress } from "node:zlib";

const compress = promisify(zstdCompress);

// Builds the header and compresses the plaintext behind it. With a base, the base's plaintext is the
// Dictionary: that is a delta with none of the ceremony — no diff format, no per-type structural knowledge —
// And the encoder's own long-range matching is what makes a near-duplicate document a few hundred bytes.
// Off the event loop, because a multi-megabyte document takes tens of milliseconds to encode
export const encodeObject = async (
  plaintext: Uint8Array,
  compressionLevel: number,
  base?: { hash: string; plaintext: Uint8Array },
): Promise<Uint8Array> => {
  const windowLog = getWindowLog(base?.plaintext.byteLength ?? 0, plaintext.byteLength);
  const payload = await compress(plaintext, {
    ...(base ? { dictionary: base.plaintext } : {}),
    params: { [constants.ZSTD_c_compressionLevel]: compressionLevel, [constants.ZSTD_c_windowLog]: windowLog },
  });
  const headerByteCount = base ? DELTA_HEADER_BYTE_COUNT : OBJECT_HEADER_BYTE_COUNT;
  const bytes = new Uint8Array(headerByteCount + payload.byteLength);
  bytes.set(OBJECT_MAGIC);
  bytes[OBJECT_VERSION_OFFSET] = OBJECT_FORMAT_VERSION;
  bytes[OBJECT_FLAGS_OFFSET] = base ? DELTA_FLAG : KEYFRAME_FLAG;
  bytes[OBJECT_WINDOW_LOG_OFFSET] = windowLog;
  if (base) bytes.set(Buffer.from(base.hash, "hex").subarray(0, HASH_BYTE_COUNT), OBJECT_HEADER_BYTE_COUNT);
  bytes.set(payload, headerByteCount);
  return bytes;
};
