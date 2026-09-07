import { AZURE_SELF_DESTRUCT_TIMER, REVERSE_TICKED_TIMESTAMP_REGEX } from "#src/services/azure/table/constants";
import { z } from "zod";

// Exactly what `getReverseTickedTimestamp` emits: a countdown from `AZURE_SELF_DESTRUCT_TIMER`, so it is digits
// Only and can never be longer than the number it counts down from. Worth constraining rather than left as a
// Bare string because this is a rowKey a client hands back on every read of one message — an empty or
// Non-numeric one is a malformed Table query, not a row that happens not to exist, and the two deserve different
// Answers.
//
// The length is bounded rather than fixed because the countdown is not zero-padded. Every real timestamp
// Produces the full width — which is what makes a lexical rowKey sort read newest-first — but the producer is
// Honest about its own extremes and so is this
export const reverseTickedTimestampSchema = z
  .string()
  .regex(REVERSE_TICKED_TIMESTAMP_REGEX)
  .max(AZURE_SELF_DESTRUCT_TIMER.length);
