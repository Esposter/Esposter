const toBytes = (view: ArrayBuffer | ArrayBufferView | SharedArrayBuffer): Uint8Array =>
  ArrayBuffer.isView(view) ? new Uint8Array(view.buffer, view.byteOffset, view.byteLength) : new Uint8Array(view);

export const checkIsSameBytes = (
  first: ArrayBuffer | ArrayBufferView | SharedArrayBuffer,
  second: ArrayBuffer | ArrayBufferView | SharedArrayBuffer,
): boolean => {
  const firstBytes = toBytes(first);
  const secondBytes = toBytes(second);
  return firstBytes.length === secondBytes.length && firstBytes.every((byte, index) => byte === secondBytes[index]);
};
