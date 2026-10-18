import type { GcsimGravityRipple } from "#src/models/genshinAssets/kits/gcsim/GcsimGravityRipple";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

// The gravity tick's switch over the reaction that fires the ripple, and each case's assignments within it
const SWITCH_REGEX = /switch maxReaction \{/u;
const CASE_REGEX = /^\s*case (?<reaction>\w+):/gmu;
const ABIL_REGEX = /\babil = "(?<abil>[^"]*)"/u;
const ELEMENT_REGEX = /\belem = (?<element>attributes\.\w+)/u;
const TALENT_REGEX = /\bmult = (?<talentVariable>\w+)\[/u;
const TRAVEL_REGEX = /\btravel = (?<travelName>\w+)/u;
// The hitmark constant each reaction's hits are named by in `init`, as a slice literal or a constant of a slice
const HITMARK_REGEX = /skillHitmarks\[(?<reaction>\w+)\] = (?:\[\]int\{(?<listName>\w+)\}|(?<name>\w+))/gu;

// The index of the brace closing the one at an index, counting the braces between
const findClosingBrace = (source: string, openIndex: number): number => {
  let depth = 0;
  for (let index = openIndex; index < source.length; index++)
    if (source[index] === "{") depth++;
    else if (source[index] === "}" && --depth === 0) return index;
  return source.length;
};

const readHitmarkNames = (source: string): Map<string, string> => {
  const hitmarkNames = new Map<string, string>();
  for (const match of source.matchAll(HITMARK_REGEX)) {
    const { listName, name, reaction } = match.groups ?? {};
    const hitmarkName = listName ?? name;
    if (reaction !== undefined && hitmarkName !== undefined) hitmarkNames.set(reaction, hitmarkName);
  }
  return hitmarkNames;
};

// The ripples a file's gravity tick switch sets, one per case that names its label, element, talent variable and hitmark
const readFileRipples = (file: string, source: string): GcsimGravityRipple[] => {
  const switchMatch = SWITCH_REGEX.exec(source);
  if (switchMatch === null) return [];
  const hitmarkNames = readHitmarkNames(source);
  const bodyStart = switchMatch.index + switchMatch[0].length;
  const body = source.slice(bodyStart, findClosingBrace(source, bodyStart - 1));
  const cases = [...body.matchAll(CASE_REGEX)];
  const ripples: GcsimGravityRipple[] = [];
  for (const [index, caseMatch] of cases.entries()) {
    const reaction = caseMatch.groups?.reaction;
    const segment = body.slice(caseMatch.index, cases[index + 1]?.index ?? body.length);
    const abil = ABIL_REGEX.exec(segment)?.groups?.abil;
    const element = ELEMENT_REGEX.exec(segment)?.groups?.element;
    const talentVariable = TALENT_REGEX.exec(segment)?.groups?.talentVariable;
    const hitmarkName = reaction === undefined ? undefined : hitmarkNames.get(reaction);
    if (
      reaction === undefined ||
      abil === undefined ||
      element === undefined ||
      talentVariable === undefined ||
      hitmarkName === undefined
    )
      continue;
    const travelName = TRAVEL_REGEX.exec(segment)?.groups?.travelName;
    // The match's leading whitespace may start on the line before, so the line is the one the keyword sits on
    const caseStart = bodyStart + caseMatch.index + caseMatch[0].indexOf("case");
    const line = source.slice(0, caseStart).split("\n").length;
    ripples.push({
      abil,
      element,
      file,
      hitmarkName,
      line,
      reaction,
      talentVariable,
      ...(travelName === undefined ? {} : { travelName }),
    });
  }
  return ripples;
};

// The gravity ripples a gcsim character's sources set, read from the switch its gravity tick sets them in
export const readGcsimGravityRipples = (sources: readonly GoSource[]): GcsimGravityRipple[] =>
  sources.flatMap(({ path, source }) => readFileRipples(path, source));
