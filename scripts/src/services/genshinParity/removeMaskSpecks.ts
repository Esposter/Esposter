// A mask's specks cleared in place, each a run of like pixels smaller than a speck: an island of ink becomes paper, and
// A hole of paper the region's edge does not reach becomes ink. The source carries both as noise, a sparkle printed on
// A logo or a pixel of compression, and a pale sparkle inside a letter would trace as a pinhole through it; a mark's
// Own parts and a letter's counters are far larger, and stay. Runs are measured by the pixels they cover, never by
// The box round their outline, so a thin part of a mark is never taken for a speck
export const removeMaskSpecks = (isInk: Uint8Array, width: number, height: number, speckArea: number): void => {
  const isVisited = new Uint8Array(isInk.length);
  const stack: number[] = [];
  for (let start = 0; start < isInk.length; start++) {
    if (isVisited[start]) continue;
    const value = isInk[start];
    const pixels: number[] = [];
    let isOpen = false;
    isVisited[start] = 1;
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
        if (neighbour !== -1 && !isVisited[neighbour] && isInk[neighbour] === value) {
          isVisited[neighbour] = 1;
          stack.push(neighbour);
        }
    }
    // Paper open to the edge is the ground, whatever its size
    if (pixels.length < speckArea && (value || !isOpen)) for (const pixel of pixels) isInk[pixel] = value ? 0 : 1;
  }
};
