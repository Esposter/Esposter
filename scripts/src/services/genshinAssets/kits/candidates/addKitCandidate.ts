import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

// A source's value for a path of a kit's record, after the others already given for it
export const addKitCandidate = (
  candidateMap: Map<string, KitCandidate[]>,
  path: string,
  candidate: KitCandidate,
): void => {
  const candidates = candidateMap.get(path) ?? [];
  candidates.push(candidate);
  candidateMap.set(path, candidates);
};
