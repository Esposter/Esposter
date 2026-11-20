import type { GcsimGravityRipple } from "#src/models/genshinAssets/kits/gcsim/GcsimGravityRipple";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsCaseClause } from "#src/services/genshinAssets/kits/gcsim/checkIsCaseClause";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The gravity tick's switch over the reaction that fires the ripple, and each case's assignments within it
const SWITCH_NAME = "switch";
const SWITCH_SUBJECT = "maxReaction";
const HITMARK_REGEX = /skillHitmarks\[(?<reaction>\w+)\] = (?:\[\]int\{(?<listName>\w+)\}|(?<name>\w+))/gu;

// The position of the first identifier named a name in a segment followed by `=`, or -1
const findAssignment = (segment: readonly GoToken[], name: string): number =>
  segment.findIndex(
    (token, index) =>
      token.kind === GoTokenKind.Identifier && token.text === name && checkIsGoPunctuation(segment[index + 1], "="),
  );

// The identifier the assignment to a name in a segment takes its value from, else undefined
const readAssignedName = (segment: readonly GoToken[], name: string): string | undefined => {
  const assignment = findAssignment(segment, name);
  const value = segment[assignment + 2];
  return assignment === -1 || value?.kind !== GoTokenKind.Identifier ? undefined : value.text;
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

// The string literal the `abil` assignment in a segment takes its value from, without its quotes, else undefined
const readAbil = (segment: readonly GoToken[]): string | undefined => {
  const assignment = findAssignment(segment, "abil");
  const value = segment[assignment + 2];
  return value?.kind === GoTokenKind.String && value.text.startsWith('"') ? value.text.slice(1, -1) : undefined;
};

// The `attributes` constant the `elem` assignment in a segment takes its value from, as `attributes.Electro`, else undefined
const readElement = (segment: readonly GoToken[]): string | undefined => {
  const assignment = findAssignment(segment, "elem");
  const [attributes, dot, element] = segment.slice(assignment + 2, assignment + 5);
  return attributes?.text === "attributes" && checkIsGoPunctuation(dot, ".") && element?.kind === GoTokenKind.Identifier
    ? `attributes.${element.text}`
    : undefined;
};

// The ripples a file's gravity tick switch sets, one per case that names its label, element, talent variable and hitmark
const readFileRipples = (file: string, source: string): GcsimGravityRipple[] => {
  const tokens = tokenizeGo(source);
  const switchIndex = tokens.findIndex(
    (token, index) =>
      token.text === SWITCH_NAME &&
      tokens[index + 1]?.text === SWITCH_SUBJECT &&
      checkIsGoPunctuation(tokens[index + 2], "{"),
  );
  if (switchIndex === -1) return [];
  const openIndex = switchIndex + 2;
  const closeIndex = findClosing(tokens, openIndex, "{", "}") ?? tokens.length;
  // A case names its reaction with a label, where a default names none
  const caseIndices = tokens.flatMap((token, index) =>
    index > openIndex &&
    index < closeIndex &&
    checkIsCaseClause(token) &&
    tokens[index + 1]?.kind === GoTokenKind.Identifier &&
    checkIsGoPunctuation(tokens[index + 2], ":")
      ? [index]
      : [],
  );
  const hitmarkNames = readHitmarkNames(source);
  const ripples: GcsimGravityRipple[] = [];
  for (const [caseOrder, caseIndex] of caseIndices.entries()) {
    const reaction = tokens[caseIndex + 1]?.text;
    const end = caseIndices[caseOrder + 1] ?? closeIndex;
    const segment = tokens.slice(caseIndex, end);
    const abil = readAbil(segment);
    const element = readElement(segment);
    const talentVariable = readAssignedName(segment, "mult");
    const hitmarkName = reaction === undefined ? undefined : hitmarkNames.get(reaction);
    if (
      reaction === undefined ||
      abil === undefined ||
      element === undefined ||
      talentVariable === undefined ||
      hitmarkName === undefined
    )
      continue;
    const travelName = readAssignedName(segment, "travel");
    ripples.push({
      abil,
      element,
      file,
      hitmarkName,
      line: tokens[caseIndex]?.line ?? 0,
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
