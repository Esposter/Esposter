// A target of four floats a pixel moved across by whole pixels, its first columns of each row repeating the row's edge,
// Which a structure is gated against: a reading's own noise, a recording's softness or an outline's pixel
export const shiftTargetAcross = (values: Float32Array, width: number, pixels: number): Float32Array =>
  Float32Array.from(values, (_value, index) => {
    const pixel = Math.floor(index / 4);
    const column = pixel % width;
    return values[(pixel - Math.min(column, pixels)) * 4 + (index % 4)] ?? 0;
  });
