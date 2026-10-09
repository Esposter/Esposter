import type { ProposalFrontmatter } from "#src/models/fleet/ProposalFrontmatter";

import { z } from "zod";

const FRONTMATTER_REGEX = /^---\n(?<block>[\s\S]*?)\n---\n/u;
// A field's value runs on over the indented lines below its key, as a formatter wraps a long flow sequence
const FIELD_REGEX = /^(?<key>[a-z]+):(?<value>.*(?:\n[ \t].*)*)$/gmu;
const LINE_BREAK_REGEX = /\s*\n\s*/gu;
const QUOTED_REGEX = /^(?<quote>["'])(?<text>.*)\k<quote>$/u;
const SEQUENCE_REGEX = /^\[(?<items>.*)\]$/u;

const ProposalFrontmatterSchema = z.object({
  needs: z.array(z.string()).default([]),
  touches: z.array(z.string()).default([]),
  waiting: z.string().default(""),
}) satisfies z.ZodType<ProposalFrontmatter>;

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

// The fleet's fields a proposal's frontmatter names, each defaulted when absent. A page with no frontmatter reads as
// Naming none of them, so it is ready to build with only its Key files as its touch set
export const parseProposalFrontmatter = (text: string): ProposalFrontmatter => {
  const block = FRONTMATTER_REGEX.exec(text)?.groups?.block ?? "";
  const fields = Object.fromEntries(
    Array.from(block.matchAll(FIELD_REGEX), ({ groups }) => {
      const value = (groups?.value ?? "").replaceAll(LINE_BREAK_REGEX, " ").trim();
      return [groups?.key ?? "", readFieldValue(value)];
    }),
  );
  return ProposalFrontmatterSchema.parse(fields);
};
