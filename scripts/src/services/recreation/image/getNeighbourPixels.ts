// The pixels beside a pixel within the image, left, right, up and down, each one that the image holds
export const getNeighbourPixels = (pixel: number, width: number, height: number): number[] => {
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  const neighbours: number[] = [];
  if (x > 0) neighbours.push(pixel - 1);
  if (x < width - 1) neighbours.push(pixel + 1);
  if (y > 0) neighbours.push(pixel - width);
  if (y < height - 1) neighbours.push(pixel + width);
  return neighbours;
};
