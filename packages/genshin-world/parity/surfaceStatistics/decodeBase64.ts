// The bytes of a base64 string, through the browser's own decoder, which reads a large array far faster than a loop
export const decodeBase64 = async (encoded: string): Promise<ArrayBuffer> => {
  const response = await fetch(`data:application/octet-stream;base64,${encoded}`);
  return response.arrayBuffer();
};
