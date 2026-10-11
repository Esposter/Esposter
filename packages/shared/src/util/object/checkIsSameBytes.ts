const toBytes = (view: ArrayBuffer | ArrayBufferView): Uint8Array =>
  view instanceof ArrayBuffer ? new Uint8Array(view) : new Uint8Array(view.buffer, view.byteOffset, view.byteLength);

export const checkIsSameBytes = (
  first: ArrayBuffer | ArrayBufferView,
  second: ArrayBuffer | ArrayBufferView,
): boolean => {
  const firstBytes = toBytes(first);
  const secondBytes = toBytes(second);
  return firstBytes.length === secondBytes.length && firstBytes.every((byte, index) => byte === secondBytes[index]);
};
