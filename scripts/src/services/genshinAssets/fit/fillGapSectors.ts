// A sector no point reached takes the lesser of its nearest reached neighbours' radii either way round, so a gap in a
// Thin blade's ring is read across its edge rather than bulging it
export const fillGapSectors = (radii: readonly number[]): number[] =>
  radii.map((radius, sector) => {
    if (radius > 0) return radius;
    const findReached = (step: number): number => {
      for (let distance = 1; distance < radii.length; distance++) {
        const reached = radii[(((sector + step * distance) % radii.length) + radii.length) % radii.length] ?? 0;
        if (reached > 0) return reached;
      }
      return 0;
    };
    return Math.min(findReached(1), findReached(-1));
  });
