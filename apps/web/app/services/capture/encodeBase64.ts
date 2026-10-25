export const encodeBase64 = (bytes: Uint8Array) => {
  const chunkSize = 32_768;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize)
    binary += String.fromCodePoint(...bytes.subarray(offset, offset + chunkSize));
  return window.btoa(binary);
};
