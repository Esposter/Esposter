import type { ParsedObject } from "#src/models/ParsedObject";

import {
  DELTA_FLAG,
  DELTA_HEADER_BYTE_COUNT,
  HASH_BYTE_COUNT,
  OBJECT_FLAGS_OFFSET,
  OBJECT_FORMAT_VERSION,
  OBJECT_HEADER_BYTE_COUNT,
  OBJECT_MAGIC,
  OBJECT_VERSION_OFFSET,
  OBJECT_WINDOW_LOG_OFFSET,
} from "#src/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Splits an object at its header. Throws on anything that is not an object this format wrote, so a stranger's
// Bytes — or a truncated head — surface as a refused read rather than reaching the decompressor
export const parseObject = (hash: string, bytes: Uint8Array): ParsedObject => {
  const hasMagic =
    bytes.byteLength >= OBJECT_HEADER_BYTE_COUNT && OBJECT_MAGIC.every((byte, index) => bytes[index] === byte);
  if (!hasMagic) throw new InvalidOperationError(Operation.Read, hash, "not a keyframe store object");
  else if (bytes[OBJECT_VERSION_OFFSET] !== OBJECT_FORMAT_VERSION)
    throw new InvalidOperationError(
      Operation.Read,
      hash,
      `unknown object format version ${bytes[OBJECT_VERSION_OFFSET]}`,
    );

  const windowLog = bytes[OBJECT_WINDOW_LOG_OFFSET] ?? 0;
  if (bytes[OBJECT_FLAGS_OFFSET] !== DELTA_FLAG)
    return { baseHash: "", payload: bytes.subarray(OBJECT_HEADER_BYTE_COUNT), windowLog };
  else if (bytes.byteLength < DELTA_HEADER_BYTE_COUNT)
    throw new InvalidOperationError(Operation.Read, hash, "delta object is truncated before its base hash");

  return {
    baseHash: Buffer.from(
      bytes.subarray(OBJECT_HEADER_BYTE_COUNT, OBJECT_HEADER_BYTE_COUNT + HASH_BYTE_COUNT),
    ).toString("hex"),
    payload: bytes.subarray(DELTA_HEADER_BYTE_COUNT),
    windowLog,
  };
};
