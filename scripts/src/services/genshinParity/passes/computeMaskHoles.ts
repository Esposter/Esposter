// A mask's holes: each run of pixels it leaves out, joined through their four neighbours, that touches no edge of the
// Frame, as the pixels it holds
export const computeMaskHoles = (mask: ArrayLike<number>, width: number, height: number): number[][] => {
  const isVisited = new Uint8Array(width * height);
  const holes: number[][] = [];
  for (let start = 0; start < width * height; start++) {
    if (mask[start] === 1 || isVisited[start] === 1) continue;
    isVisited[start] = 1;
    const pixels = [start];
    let isTouchingEdge = false;
    // The run grows as it is walked, which an array iterator follows
    for (const pixel of pixels) {
      const column = pixel % width;
      const row = Math.floor(pixel / width);
      if (column === 0 || row === 0 || column === width - 1 || row === height - 1) isTouchingEdge = true;
      for (const [neighbour, isInFrame] of [
        [pixel - 1, column > 0],
        [pixel + 1, column < width - 1],
        [pixel - width, row > 0],
        [pixel + width, row < height - 1],
      ] as const) {
        if (!isInFrame || mask[neighbour] === 1 || isVisited[neighbour] === 1) continue;
        isVisited[neighbour] = 1;
        pixels.push(neighbour);
      }
    }
    if (!isTouchingEdge) holes.push(pixels);
  }
  return holes;
};
