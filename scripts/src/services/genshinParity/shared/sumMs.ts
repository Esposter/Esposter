export const sumMs = (passUseMap: Map<string, { ms: number }>): number =>
  [...passUseMap.values()].reduce((total, { ms }) => total + ms, 0);
