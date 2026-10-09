// The twiddles of every stage of a transform of `length` points, each stage's `size / 2` laid end to end, so the stage
// Whose blocks are `size` long reads its `offset` at `size / 2 - 1 + offset`. Worked out once per length, as the
// Stages' angles are the same for every spectrum of that length
const twiddleTableMap = new Map<number, { imaginary: Float64Array; real: Float64Array }>();
const getTwiddleTable = (length: number): { imaginary: Float64Array; real: Float64Array } => {
  const cachedTable = twiddleTableMap.get(length);
  if (cachedTable) return cachedTable;
  const real = new Float64Array(Math.max(length - 1, 0));
  const imaginary = new Float64Array(Math.max(length - 1, 0));
  for (let index = 0, size = 2; size <= length; size <<= 1) {
    const angle = (-2 * Math.PI) / size;
    for (let offset = 0; offset < size >> 1; offset++, index++) {
      real[index] = Math.cos(angle * offset);
      imaginary[index] = Math.sin(angle * offset);
    }
  }
  const table = { imaginary, real };
  twiddleTableMap.set(length, table);
  return table;
};

// The discrete Fourier transform of a signal whose length is a power of two, in place: its real and imaginary parts
// Overwritten by its spectrum's, by the iterative radix-2 Cooley–Tukey butterfly over a bit-reversed order. Each
// Stage walks its twiddles outermost, so one is read for every block that turns by it
export const transformFourier = (real: Float64Array, imaginary: Float64Array): void => {
  const { length } = real;
  for (let index = 1, reversed = 0; index < length; index++) {
    let bit = length >> 1;
    for (; reversed & bit; bit >>= 1) reversed ^= bit;
    reversed ^= bit;
    if (index < reversed) {
      [real[index], real[reversed]] = [real[reversed] ?? 0, real[index] ?? 0];
      [imaginary[index], imaginary[reversed]] = [imaginary[reversed] ?? 0, imaginary[index] ?? 0];
    }
  }
  const twiddles = getTwiddleTable(length);
  for (let size = 2; size <= length; size <<= 1) {
    const half = size >> 1;
    for (let offset = 0; offset < half; offset++) {
      const twiddleReal = twiddles.real[half - 1 + offset] ?? 0;
      const twiddleImaginary = twiddles.imaginary[half - 1 + offset] ?? 0;
      for (let even = offset; even < length; even += size) {
        const odd = even + half;
        const oddReal = (real[odd] ?? 0) * twiddleReal - (imaginary[odd] ?? 0) * twiddleImaginary;
        const oddImaginary = (real[odd] ?? 0) * twiddleImaginary + (imaginary[odd] ?? 0) * twiddleReal;
        real[odd] = (real[even] ?? 0) - oddReal;
        imaginary[odd] = (imaginary[even] ?? 0) - oddImaginary;
        real[even] = (real[even] ?? 0) + oddReal;
        imaginary[even] = (imaginary[even] ?? 0) + oddImaginary;
      }
    }
  }
};
