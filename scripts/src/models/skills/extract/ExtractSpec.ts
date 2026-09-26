import type { ExtractMove } from "#src/models/skills/extract/ExtractMove";

export interface ExtractSpec {
  // The SKILL.md heading whose list indexes the reference pages, created at the end when absent
  indexHeading?: string;
  moves: ExtractMove[];
  skill: string;
  // The page the moves come out of, without `references/` or `.md`, when a page rather than SKILL.md is being split;
  // New pages are indexed in SKILL.md either way
  source?: string;
}
