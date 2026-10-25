import type { ProposalMetadata } from "#src/models/fleet/ProposalMetadata";

import { readFieldValue } from "#src/services/fleet/readFieldValue";
import { z } from "zod";

// A field's value runs on over the indented lines below its key, as a formatter wraps a long flow sequence
const FIELD_REGEX = /^(?<key>[a-z][\w-]*):(?<value>.*(?:\n[ \t].*)*)$/gmu;
const LINE_BREAK_REGEX = /\s*\n\s*/gu;

// OpenSpec keeps its own keys and leaves an `x-` key to the tools that read it
const ProposalMetadataSchema = z
  .object({
    "x-needs": z.array(z.string()).default([]),
    "x-touches": z.array(z.string()).default([]),
    "x-waiting": z.string().default(""),
  })
  .transform(({ "x-needs": needs, "x-touches": touches, "x-waiting": waiting }) => ({
    needs,
    touches,
    waiting,
  })) satisfies z.ZodType<ProposalMetadata>;

// The fleet's fields a change's `.openspec.yaml` names, each defaulted when absent. A change naming none of them is
// Ready to build with only its Key files as its touch set
export const parseProposalMetadata = (text: string): ProposalMetadata => {
  const fields = Object.fromEntries(
    Array.from(text.matchAll(FIELD_REGEX), ({ groups }) => {
      const value = (groups?.value ?? "").replaceAll(LINE_BREAK_REGEX, " ").trim();
      return [groups?.key ?? "", readFieldValue(value)];
    }),
  );
  return ProposalMetadataSchema.parse(fields);
};
