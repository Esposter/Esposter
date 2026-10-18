const INDEXED_HIT_REGEX = /^(?<group>.+)\.(?<index>\d+)$/u;

// A hit's list and its place in it: `hits.fatalBlossoms.1` is the second hit of `hits.fatalBlossoms`, and a hit with no
// Place is the first of a list of its own
export const splitHitPath = (hitPath: string): { group: string; index: number } => {
  const groups = INDEXED_HIT_REGEX.exec(hitPath)?.groups;
  return groups?.group === undefined
    ? { group: hitPath, index: 0 }
    : { group: groups.group, index: Number(groups.index) };
};
