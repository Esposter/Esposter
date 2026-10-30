// What packing the record files named on the command line did: each file's path in the parity folder and size.
// It also counts how many accounts received an upload across them
export interface RecordPathsOutcome {
  packed: { bytes: number; path: string }[];
  uploads: number;
}
