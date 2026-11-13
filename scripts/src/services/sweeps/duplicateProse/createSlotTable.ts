// The bits of a 53-bit key an entry's home position is read from: the top ones, which a polynomial hash mixes best
const KEY_BITS = 53;
const MIN_TABLE_BITS = 4;

export interface SlotTable {
  get: (key: number) => number | undefined;
  set: (key: number, slot: number) => void;
}

// A table of at most `capacity` keys below 2^53, each holding a slot number, in two typed arrays and with no
// Allocation per entry: a `Map` keyed by non-integer numbers allocates one for each key it holds, which is the cost
// Once the keys are millions. It probes linearly, so the table is sized to stay under two thirds full.
export const createSlotTable = (capacity: number): SlotTable => {
  const bits = Math.max(MIN_TABLE_BITS, Math.ceil(Math.log2(capacity * 1.5)));
  const size = 2 ** bits;
  const mask = size - 1;
  const divisor = 2 ** (KEY_BITS - bits);
  const keys = new Float64Array(size);
  // A slot is held plus one, so zero is an empty position rather than slot zero
  const heldSlots = new Int32Array(size);
  const getHome = (key: number): number => Math.floor(key / divisor) & mask;

  return {
    get: (key) => {
      for (let position = getHome(key); ; position = (position + 1) & mask) {
        const heldSlot = heldSlots[position] ?? 0;
        if (heldSlot === 0) return undefined;
        if (keys[position] === key) return heldSlot - 1;
      }
    },
    set: (key, slot) => {
      let position = getHome(key);
      while ((heldSlots[position] ?? 0) !== 0) position = (position + 1) & mask;
      keys[position] = key;
      heldSlots[position] = slot + 1;
    },
  };
};
