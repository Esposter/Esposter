import type { ProposalMetadata } from "#src/models/fleet/ProposalMetadata";

import { z } from "zod";

// A field's value runs on over the indented lines below its key, as a formatter wraps a long flow sequence
const FIELD_REGEX = /^(?<key>[a-z][\w-]*):(?<value>.*(?:\n[ \t].*)*)$/gmu;
const LINE_BREAK_REGEX = /\s*\n\s*/gu;
const QUOTED_REGEX = /^(?<quote>["'])(?<text>.*)\k<quote>$/u;
const SEQUENCE_REGEX = /^\[(?<items>.*)\]$/u;

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

const unquote = (value: string): string => QUOTED_REGEX.exec(value)?.groups?.text ?? value;

// A field is a flow sequence of strings (`[a, "b"]`) or one string, quoted or bare. A sequence field given as a bare
// String fails the schema, so a mistyped field is loud rather than silently empty
const readFieldValue = (value: string): string | string[] => {
  const items = SEQUENCE_REGEX.exec(value)?.groups?.items;
  return items === undefined
    ? unquote(value.trim())
    : items
        .split(",")
        .map((item) => unquote(item.trim()))
        .filter((item) => item !== "");
};

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
