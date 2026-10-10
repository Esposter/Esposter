import { getMonoBehaviourFieldsOffset } from "#src/services/genshinAssets/shared/getMonoBehaviourFieldsOffset";

const WORD = 4;
// Each entry is the chunk's offset into its data blob and a 64-bit hash naming the chunk
const ENTRY_BYTES = 12;
// A streaming index's chunk offsets, read from its MonoBehaviour's raw export (`BigWorld_1_-2_Index`): past its name, a
// Count, then per chunk its offset into the StreamGen blob the index is named for, counted from past the blob's own
// Length word, and a hash this does not read
export const parseStreamingIndex = (bytes: Buffer): number[] => {
  const countOffset = getMonoBehaviourFieldsOffset(bytes);
  const count = bytes.readUInt32LE(countOffset);
  return Array.from({ length: count }, (_value, index) => bytes.readUInt32LE(countOffset + WORD + index * ENTRY_BYTES));
};
