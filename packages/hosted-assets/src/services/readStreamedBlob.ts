// A response's body read chunk by chunk, each chunk reported as it arrives, and its whole given back as one blob
export const readStreamedBlob = async (response: Response, onChunk: (byteLength: number) => void): Promise<Blob> => {
  const reader = response.body?.getReader();
  if (reader === undefined) return response.blob();
  const chunks: BlobPart[] = [];
  let result = await reader.read();
  while (!result.done) {
    chunks.push(result.value);
    onChunk(result.value.byteLength);
    // oxlint-disable-next-line no-await-in-loop -- Async iteration: the body is a stream read chunk by chunk, so each read takes the next chunk after the last one
    result = await reader.read();
  }
  return new Blob(chunks);
};
