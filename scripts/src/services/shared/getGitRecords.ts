import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";

// The records of a log git printed under a `%x1E`-terminated format, each split into its `%x1F` fields: the
// Terminator leaves an empty record after the last one, and a format that opens on `%H` leaves a newline before
// Every one but the first, so both are dropped here rather than at each reader
export const getGitRecords = (log: string): string[][] =>
  log
    .split(RECORD_SEPARATOR)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => record.split(FIELD_SEPARATOR));
