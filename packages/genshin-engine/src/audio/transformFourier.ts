// The discrete Fourier transform of a signal whose length is a power of two, in place: its real and imaginary parts
// Overwritten by its spectrum's, by the iterative radix-2 Cooley–Tukey butterfly over a bit-reversed order
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
  for (let size = 2; size <= length; size <<= 1) {
    const half = size >> 1;
    const angle = (-2 * Math.PI) / size;
    for (let start = 0; start < length; start += size)
      for (let offset = 0; offset < half; offset++) {
        const twiddleReal = Math.cos(angle * offset);
        const twiddleImaginary = Math.sin(angle * offset);
        const even = start + offset;
        const odd = even + half;
        const oddReal = (real[odd] ?? 0) * twiddleReal - (imaginary[odd] ?? 0) * twiddleImaginary;
        const oddImaginary = (real[odd] ?? 0) * twiddleImaginary + (imaginary[odd] ?? 0) * twiddleReal;
        real[odd] = (real[even] ?? 0) - oddReal;
        imaginary[odd] = (imaginary[even] ?? 0) - oddImaginary;
        real[even] = (real[even] ?? 0) + oddReal;
        imaginary[even] = (imaginary[even] ?? 0) + oddImaginary;
      }
  }
};
