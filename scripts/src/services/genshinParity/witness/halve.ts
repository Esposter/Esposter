// Half the size, each pixel the mean of the four it covers
export const halve = (values: Float32Array, width: number, height: number): Float32Array => {
  const halfWidth = Math.floor(width / 2);
  return Float32Array.from({ length: halfWidth * Math.floor(height / 2) }, (_value, index) => {
    const x = (index % halfWidth) * 2;
    const y = Math.floor(index / halfWidth) * 2;
    return (
      ((values[y * width + x] ?? 0) +
        (values[y * width + x + 1] ?? 0) +
        (values[(y + 1) * width + x] ?? 0) +
        (values[(y + 1) * width + x + 1] ?? 0)) /
      4
    );
  });
};
