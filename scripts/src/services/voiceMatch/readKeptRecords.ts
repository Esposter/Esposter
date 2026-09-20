import { readGeneratedJson } from "#src/services/voiceMatch/readGeneratedJson";

// The last run's records by entity name, for a stage to keep instead of measuring the entity again — none on a fresh
// Run, so every entity is measured
export const readKeptRecords = <T extends { name: string }>(directory: string, isFresh: boolean): Map<string, T> =>
  new Map(isFresh ? [] : readGeneratedJson<T>(directory).map((record) => [record.name, record]));
