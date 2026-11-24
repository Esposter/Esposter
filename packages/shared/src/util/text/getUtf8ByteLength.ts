// The scratch the encoder writes into and the count reads back from. Its size bounds what a long text holds in memory:
// The text is written into it a part at a time, so a text of any length costs this buffer and nothing more
const SCRATCH_BYTES = 2 ** 16;
const textEncoder = new TextEncoder();
const scratch = new Uint8Array(SCRATCH_BYTES);

// The UTF-8 byte length of a text, without allocating its bytes: `encode(text).byteLength` builds a buffer only to read
// Its length, where `encodeInto` writes into one buffer kept for every call. It never splits a surrogate pair across
// Two parts, so the parts add up to the whole text's length
export const getUtf8ByteLength = (text: string): number => {
  let byteLength = 0;
  let offset = 0;
  while (offset < text.length) {
    const { read, written } = textEncoder.encodeInto(offset === 0 ? text : text.slice(offset), scratch);
    byteLength += written;
    offset += read;
  }
  return byteLength;
};
