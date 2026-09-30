// A mask's holes smaller than a speck filled with ink, in place: every run of paper the region's edge does not reach,
// Found by filling the paper from its edge, whose area is under the speck's. A pale sparkle printed on a mark splits as
// Paper and would trace as a pinhole through the mark; a letter's counter is far larger, and stays open
export const fillSpeckHoles = (isInk: Uint8Array, width: number, height: number, speckArea: number): void => {
  const label = new Int32Array(isInk.length).fill(-1);
  const stack: number[] = [];
  for (let start = 0; start < isInk.length; start++) {
    if (isInk[start] || label[start] !== -1) continue;
    // One run of paper, its pixels labelled as they are reached, and whether any lies on the region's edge
    const pixels: number[] = [];
    let isOpen = false;
    label[start] = start;
    stack.push(start);
    while (stack.length > 0) {
      const pixel = stack.pop() ?? 0;
      pixels.push(pixel);
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) isOpen = true;
      for (const neighbour of [
        x > 0 ? pixel - 1 : -1,
        x < width - 1 ? pixel + 1 : -1,
        y > 0 ? pixel - width : -1,
        y < height - 1 ? pixel + width : -1,
      ])
        if (neighbour !== -1 && !isInk[neighbour] && label[neighbour] === -1) {
          label[neighbour] = start;
          stack.push(neighbour);
        }
    }
    if (!isOpen && pixels.length < speckArea) for (const pixel of pixels) isInk[pixel] = 1;
  }
};
