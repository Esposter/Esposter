// What packing recording or record files named on the command line did: each file's name and size, and how many accounts
// received an upload across them
export interface ReferencePathsOutcome {
  packed: { bytes: number; name: string }[];
  uploads: number;
}
