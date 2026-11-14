import { AZURE_SELF_DESTRUCT_TIMER, REVERSE_TICKED_TIMESTAMP_REGEX } from "#src/services/message/constants";
import { z } from "zod";

// A countdown from `AZURE_SELF_DESTRUCT_TIMER`, so it is digits only and can never be longer than the number it counts
// Down from. Worth constraining rather than left as a bare string because this is a rowKey a client hands back on every
// Read of one message — an empty or non-numeric one is a malformed key, not a row that happens not to exist, and the two
// Deserve different answers.
//
// The length is bounded rather than fixed because the countdown is not zero-padded. Every real timestamp produces the full
// Width, which is what makes a lexical rowKey sort read newest-first, but the schema accepts any countdown the timer can
// Hold. Branded both ways so a bare string, the empty sentinel included, is a type error wherever a rowKey is declared —
// A tRPC caller's input as well as a parsed output
export const reverseTickedTimestampSchema = z
  .string()
  .regex(REVERSE_TICKED_TIMESTAMP_REGEX)
  .max(AZURE_SELF_DESTRUCT_TIMER.length)
  .brand<"ReverseTickedTimestamp", "inout">();
// A branded schema cannot satisfy a hand-written type, so the type is read off the schema
export type ReverseTickedTimestamp = z.infer<typeof reverseTickedTimestampSchema>;
