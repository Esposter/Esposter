import { CATALOGUE_HEADING, SETTLED_HEADING } from "#src/services/sweeps/skillDocs/constants";

// The run of words that reads as a copy rather than a phrase two writers reach for: a rule stated in one skill and
// Restated in another shares whole sentences, while the pointer both write ("see the formatting skill") is shorter
export const SHINGLE_SIZE = 14;
// The run of words that reads as a path rather than prose: three segments of one tracked path in a row
// (`docs resource sheet`) are a citation, where two (`the docs`) are what any sentence about the repo says
export const PATH_SHINGLE_SIZE = 3;
// The two headings whose lines the convention already decides the shape of, so a run inside one is readable
// Where a run in ordinary prose is a candidate a pass has to judge
export const POINTER_HEADINGS: ReadonlySet<string> = new Set([CATALOGUE_HEADING, SETTLED_HEADING]);
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const SKILL_NAME_REGEX: RegExp = /^[\w-]+$/u;
