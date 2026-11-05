import type { ProposalMetadata } from "#src/models/fleet/ProposalMetadata";

import { readFieldValue } from "#src/services/fleet/readFieldValue";
import { z } from "zod";

// A field's value runs on over the indented lines below its key, as a formatter wraps a long flow sequence
const FIELD_REGEX = /^(?<key>[a-z][\w-]*):(?<value>.*(?:\n[ \t].*)*)$/gmu;
const LINE_BREAK_REGEX = /\s*\n\s*/gu;
const PHASE_REGEX = /^\d+$/u;
const MAX_PHASE = 7;

// OpenSpec keeps its own keys and leaves an `x-` key to the tools that read it. A phase is read off its text as an
// Integer, so a word or a fraction fails the regex and a number past the last phase fails the range
const ProposalMetadataSchema = z
  .object({
    "x-needs": z.array(z.string()).default([]),
    "x-phase": z.string().regex(PHASE_REGEX).transform(Number).pipe(z.int().min(0).max(MAX_PHASE)).optional(),
    "x-touches": z.array(z.string()).default([]),
    "x-waiting": z.string().default(""),
  })
  .transform(({ "x-needs": needs, "x-phase": phase, "x-touches": touches, "x-waiting": waiting }) => ({
    needs,
    phase,
    touches,
    waiting,
  })) satisfies z.ZodType<ProposalMetadata>;

// The fleet's fields a change's `.openspec.yaml` names, each defaulted when absent, and its phase, undefined when it
// Names none. A change naming none of them is ready to build with only its Key files as its touch set
export const parseProposalMetadata = (text: string): ProposalMetadata => {
  const fields = Object.fromEntries(
    Array.from(text.matchAll(FIELD_REGEX), ({ groups }) => {
      const value = (groups?.value ?? "").replaceAll(LINE_BREAK_REGEX, " ").trim();
      return [groups?.key ?? "", readFieldValue(value)];
    }),
  );
  return ProposalMetadataSchema.parse(fields);
};
