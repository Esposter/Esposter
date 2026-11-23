import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { Except } from "type-fest";

// A row as an entry writes it. A row the client created has no version yet, and holds none until the server names one
export type Draft<TRow extends Versioned> = { version?: number } & Except<TRow, "version">;
