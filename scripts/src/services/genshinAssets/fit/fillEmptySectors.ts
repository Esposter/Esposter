// The radius of the nearest sector that holds one, so a gap in a band's sampling is read across rather than as the axis
export const fillEmptySectors = (radii: readonly number[]): number[] =>
  radii.map((radius, sector) => {
    if (radius > 0) return radius;
    for (let distance = 1; distance <= radii.length; distance++) {
      const nearest = [
        radii[(sector + distance) % radii.length],
        radii[(sector - distance + radii.length) % radii.length],
      ].find((candidate) => candidate !== undefined && candidate > 0);
      if (nearest !== undefined) return nearest;
    }
    return radius;
  });
