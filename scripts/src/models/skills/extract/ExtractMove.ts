import type { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";

export interface ExtractMove {
  // The page's line in the SKILL.md index, required when the move creates the page
  index?: string;
  // Deletes the block rather than moving it, for a copy of a rule another page already owns
  isDropped?: true;
  // What stays in SKILL.md where the block was — the one-line rule naming the page
  keep?: string;
  // The exact heading line of a section, or the opening of a bullet's first line
  match: string;
  // The reference page's file name, without `references/` or `.md`
  page: string;
  // The opening paragraph of a page the move creates, which starts with "Read "
  read?: string;
  // A heading the block goes under on its page
  subheading?: string;
  // The title of a page the move creates
  title?: string;
  type: ExtractMoveType;
}
