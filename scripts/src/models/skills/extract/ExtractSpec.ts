import type { ExtractMove } from "#src/models/skills/extract/ExtractMove";

export interface ExtractSpec {
  // The SKILL.md heading whose list indexes the reference pages, created at the end when absent
  indexHeading?: string;
  moves: ExtractMove[];
  skill: string;
}
