export const DANGLING_PROGRAM_BINDING_REASON = "program has no resolvable audience or survey binding";
// A D1 statement binds at most 100 parameters, and a participant row binds seven columns, so the inserts go in batches
// of this many rows
export const PROGRAM_PARTICIPANT_BATCH_SIZE = 10;
