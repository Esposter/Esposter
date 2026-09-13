export interface WrittenVersion {
  // The keyframe this version decodes against, empty when the version is itself a keyframe — which is also how
  // A caller knows the lineage anchor moved
  baseHash: string;
  hash: string;
  // Whether the content was already held, in which case nothing was written
  isDeduplicated: boolean;
  plaintextBytes: number;
  // What the owner is charged, and zero for a version whose content the store already held
  storedBytes: number;
}
