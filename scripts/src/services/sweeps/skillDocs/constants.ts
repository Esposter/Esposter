export const MAX_SKILL_BYTES = 15000;
// Claude Code shows this many characters of a description in its skill listing and nothing past them
export const MAX_DESCRIPTION_CHARACTERS = 1536;
// The trigger is the first thing a truncated listing keeps, so it is the fixed opening of every description
export const DESCRIPTION_OPENING = "Apply when ";
// A settled direction written two thirds down a skill is re-derived by the reader who loaded the very skill that
// Rejects it, so the list is the first section or it is not doing its job (`skill-authoring`,
// `references/settled-lists.md`). The heading is one fixed string for the same reason the opening line is:
// A shape decides, an intent has to be judged — and the index skills' catalogue is the same shape one level up.
export const SETTLED_HEADING = "## Settled — do not re-propose";
export const CATALOGUE_HEADING = "## The catalogue";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const CITATION_REGEX: RegExp = /`references\/(?<target>[\w.-]+\.md)`/gu;
