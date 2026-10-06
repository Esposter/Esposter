const WORD = 4;
// A MonoBehaviour's raw export leads with its game object and script as pointers and its enabled flag, then its name, a
// Length and that many characters aligned to four
const NAME_LENGTH_OFFSET = 28;
// Each entry is the chunk's offset into its data blob and a 64-bit hash naming the chunk
const ENTRY_BYTES = 12;
// A streaming index's chunk offsets, read from its MonoBehaviour's raw export (`BigWorld_1_-2_Index`): after the
// Header, a count, then per chunk its offset into the StreamGen blob the index is named for, counted from past the
// Blob's own length word, and a hash this does not read
export const parseStreamingIndex = (bytes: Buffer): number[] => {
  const nameLength = bytes.readUInt32LE(NAME_LENGTH_OFFSET);
  const countOffset = NAME_LENGTH_OFFSET + WORD + Math.ceil(nameLength / WORD) * WORD;
  const count = bytes.readUInt32LE(countOffset);
  return Array.from({ length: count }, (_, index) => bytes.readUInt32LE(countOffset + WORD + index * ENTRY_BYTES));
};
