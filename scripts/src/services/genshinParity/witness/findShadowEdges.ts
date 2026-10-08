// A shadow's edges over flat receivers: each shadowed receiver pixel with a lit receiver beside it, along a row or a
// Column, so an edge is one pixel wide on its shadow's side and a shadow running off a receiver onto anything else draws
// No edge there, where the receiver's own outline would stand in for the shadow's
export const findShadowEdges = (
  isShadowed: Uint8Array,
  isReceiver: Uint8Array,
  width: number,
  height: number,
): Uint8Array =>
  Uint8Array.from(isShadowed, (shadowed, pixel) => {
    if (!shadowed || !isReceiver[pixel]) return 0;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const neighbours = [
      x > 0 ? pixel - 1 : -1,
      x < width - 1 ? pixel + 1 : -1,
      y > 0 ? pixel - width : -1,
      y < height - 1 ? pixel + width : -1,
    ];
    return Number(neighbours.some((neighbour) => neighbour >= 0 && isReceiver[neighbour] && !isShadowed[neighbour]));
  });
