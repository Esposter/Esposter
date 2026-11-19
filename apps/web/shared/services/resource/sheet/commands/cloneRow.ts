import { toRawDeep } from "@esposter/shared";

// A row's data copied out of reactive state, so a command that holds it, on the client or on the server, keeps the
// Values it was given rather than whatever a later edit leaves in the state
export const cloneRow = <TRow extends object>(row: TRow) => structuredClone(toRawDeep(row));
