import { InvalidOperationError, Operation } from "@esposter/shared";

// The floats a byte run holds, read through a view over its buffer rather than a copy. A run that is not a whole number
// Of floats is refused, since a view would drop its last bytes without a word
export const readFloat32Array = (bytes: Uint8Array): Float32Array => {
  if (bytes.byteLength % Float32Array.BYTES_PER_ELEMENT !== 0)
    throw new InvalidOperationError(
      Operation.Read,
      readFloat32Array.name,
      `a byte run of ${bytes.byteLength} is not a whole number of 32-bit floats`,
    );
  return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / Float32Array.BYTES_PER_ELEMENT);
};
