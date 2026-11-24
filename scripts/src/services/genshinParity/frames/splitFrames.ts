import { InvalidOperationError, Operation } from "@esposter/shared";

// The frames of a clip's bytes as they arrive in chunks that cut across them, each frame of the same length. A clip
// That ends partway through a frame is refused, since its last row would read another frame's bytes
export const splitFrames = async function* (
  chunks: AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
  frameBytes: number,
): AsyncGenerator<Uint8Array> {
  let pending = Buffer.alloc(0);
  for await (const chunk of chunks) {
    const joined = Buffer.concat([pending, chunk]);
    let offset = 0;
    for (; offset + frameBytes <= joined.length; offset += frameBytes)
      yield joined.subarray(offset, offset + frameBytes);
    pending = joined.subarray(offset);
  }
  if (pending.length > 0) throw new InvalidOperationError(Operation.Read, "frames", "ends partway through a frame");
};
