import { transformFourier } from "#src/audio/transformFourier";

// The discrete Fourier transform of a grid whose sides are powers of two, in place, its rows first and then its
// Columns (`transformFourier`), its real and imaginary parts held row after row
export const transformFourierGrid = (
  real: Float64Array,
  imaginary: Float64Array,
  width: number,
  height: number,
): void => {
  for (let row = 0; row < height; row++)
    transformFourier(real.subarray(row * width, (row + 1) * width), imaginary.subarray(row * width, (row + 1) * width));
  const [columnReal, columnImaginary] = [new Float64Array(height), new Float64Array(height)];
  for (let column = 0; column < width; column++) {
    for (let row = 0; row < height; row++) {
      columnReal[row] = real[row * width + column] ?? 0;
      columnImaginary[row] = imaginary[row * width + column] ?? 0;
    }
    transformFourier(columnReal, columnImaginary);
    for (let row = 0; row < height; row++) {
      real[row * width + column] = columnReal[row] ?? 0;
      imaginary[row * width + column] = columnImaginary[row] ?? 0;
    }
  }
};
