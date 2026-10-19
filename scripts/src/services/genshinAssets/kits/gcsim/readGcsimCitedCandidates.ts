import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { AttackArea } from "genshin-world";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { GCSIM_CHARACTERS_PATH, GCSIM_DURABILITY_PER_GAUGE } from "#src/services/genshinAssets/kits/constants";
import { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGcsimCitedArea } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedArea";
import { readGcsimEnclosingLoop } from "#src/services/genshinAssets/kits/gcsim/readGcsimEnclosingLoop";
import { createGcsimFileResolver } from "#src/services/genshinAssets/kits/gcsim/readGcsimFileConstant";
import { readGcsimLineExpressionStarts } from "#src/services/genshinAssets/kits/gcsim/readGcsimLineExpressionStarts";
import { readGcsimLineValues } from "#src/services/genshinAssets/kits/gcsim/readGcsimLineValues";
import { readGcsimQueueDelay } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueueDelay";
import { substituteGoTableCells } from "#src/services/genshinAssets/kits/gcsim/readGcsimTableCells";
import { resolveGoLocals } from "#src/services/genshinAssets/kits/gcsim/resolveGoLocals";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { toKitSeconds } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The record's hit field measured from the action's start, as BaseKitHitRecord's schema has it: the only field an
// Action's hit adds a queued block's delay to. A duration, an interval or a count is cited as written, in any block
const HITMARK_FIELD = "hitmarkFrames";

// The record's hit field in units of U, which gcsim writes as a durability of GCSIM_DURABILITY_PER_GAUGE to the unit
const GAUGE_FIELD = "gauge";

// The most lines an area's constructor may run across, its arguments on the lines under its opening line
const MAX_CONSTRUCTOR_LINES = 12;

// The hit counter a normal attack's table index reads, the action's own number, as its path names `normalAttacks.<n>`
const NORMAL_ATTACK_PATH_REGEX = /^normalAttacks\.(?<counter>\d+)\./u;

const readNormalCounter = (path: string): number | undefined => {
  const counter = NORMAL_ATTACK_PATH_REGEX.exec(path)?.groups?.counter;
  return counter === undefined ? undefined : Number(counter);
};

// A module-scope table's declaration, `name = [][]float64{` or `name = []float64{`
const TABLE_DECLARATION_REGEX = /^\s*(?:var |const )?(?<name>[A-Za-z_]\w*)\s*(?::=|=)\s*\[\]/u;

const countParentheses = (text: string, character: string): number => text.split(character).length - 1;

// The constructor on a line with the lines its arguments run on, up to the parenthesis that closes it
const readConstructorText = (lines: readonly string[], lineIndex: number): string => {
  let text = lines[lineIndex] ?? "";
  let depth = countParentheses(text, "(") - countParentheses(text, ")");
  for (
    let next = lineIndex + 1;
    depth > 0 && next < lines.length && next <= lineIndex + MAX_CONSTRUCTOR_LINES;
    next++
  ) {
    const line = lines[next] ?? "";
    text += `\n${line}`;
    depth += countParentheses(line, "(") - countParentheses(line, ")");
  }
  return text;
};

// The constructor an area is read from, by the line it is cited at. A table's declaration line is cited by its row, so the
// Constructor is the nearest `combat.New` line above the first use of the table below it; any other line is its own
const readConstructorIndex = (lines: readonly string[], lineIndex: number): number => {
  const name = TABLE_DECLARATION_REGEX.exec(lines[lineIndex] ?? "")?.groups?.name;
  if (name === undefined) return lineIndex;
  const use = lines.findIndex((line, index) => index > lineIndex && line.includes(`${name}[`));
  if (use === -1) return lineIndex;
  let constructor = use;
  while (constructor > lineIndex && !(lines[constructor] ?? "").includes("combat.New")) constructor--;
  return constructor > lineIndex ? constructor : lineIndex;
};

// The area a cited constructor gives, read across its lines, with its line: the row of the table whose cell is the
// Area's radius where the constructor reads a table, else the first table cell it reads, else the constructor's own line.
// A table index that is not evaluable gives no area
const readCitedArea = (
  lines: readonly string[],
  lineIndex: number,
  file: string,
  counter: number | undefined,
): undefined | { area: AttackArea; line: number } => {
  const constructorText = readConstructorText(lines, lineIndex);
  // The arguments are read with the locals they name resolved, the constructor's own name and its left side left as they are
  const open = constructorText.indexOf("(");
  if (open === -1) return undefined;
  const argumentText = resolveGoLocals(constructorText.slice(open + 1), lines, lineIndex);
  if (argumentText === undefined) return undefined;
  const table = substituteGoTableCells(`${constructorText.slice(0, open + 1)}${argumentText}`, lines, counter);
  if (table === undefined) return undefined;
  const area = readGcsimCitedArea(table.text, file);
  if (area === undefined) return undefined;
  const cite = table.cites.find(({ value }) => value === area.radius) ?? table.cites[0];
  return { area, line: cite?.line ?? lineIndex + 1 };
};

// The frame the action runs from, `c.Core.F`, which a line's expressions read as zero: the action's start
const ACTION_FRAME_NAME = "c.Core.F";
const ACTION_FRAME_VALUE = 0;

// The suffix of a field that counts seconds, which a count of frames over the frame rate gives
const SECONDS_FIELD_SUFFIX = "Seconds";

// The path of an action's hit, `burst.hits.0.hitmarkFrames` and the like, as opposed to a named hit's, `hits.<name>`
const ACTION_HIT_PATH_REGEX =
  /^(?:normalAttacks|chargedAttack|plunges|plungeCollision|skill\.hits|skillHolds|burst\.hits)\./u;

// A cited file as a cited line's value is read from it: its name below the folder as the overlay cites it, the folder's
// Character whose constants and queue calls its names resolve through, and the file's lines and tokens
interface CitedFile {
  fileName: string;
  gcsim: GcsimCharacter;
  lines: readonly string[];
  tokens: readonly GoToken[];
}

// The hitmarks readGcsimQueuedAttacks reads for a file's queue calls on a line, each the delay its call is queued at
// With the tasks around it, as the mechanical path writes it. Where the cited hit has a loop index, only the call of
// The iteration that index names is one of them
const readQueuedHitmarks = (
  queuedAttacks: readonly GcsimQueuedAttack[],
  fileName: string,
  line: number,
  hitIndex: number | undefined,
  loopIndex: string | undefined,
): number[] =>
  queuedAttacks.flatMap(({ delay, file, iterations, line: queuedLine }) =>
    file === fileName &&
    queuedLine === line &&
    delay !== undefined &&
    (hitIndex === undefined || loopIndex === undefined || iterations?.[loopIndex] === hitIndex)
      ? [delay]
      : [],
  );

// The value a cited line gives, in the record's units: its one value equal to the cited value, or its first where none
// Is. A gauge line gives its durability over GCSIM_DURABILITY_PER_GAUGE, in units of U. A seconds field gives its
// Frames over the frame rate, with those converted values first and its frames after them. An action's hit on a queue
// Call's line is the hitmark readGcsimQueuedAttacks reads for that call. Otherwise a line gives its literal numbers,
// And the value of each expression that starts on it, with its locals, constants and loop index resolved. In a `for`
// Loop, an array of that line's value at each index of the loop, taken at the one expression position whose values
// Equal the cited array, or at the first position where none does; a scalar citation takes the equal value, as outside
// One. A cited entry of a run of hits takes the loop's element at its index, matched as its hit is cited.
const readCitedValue = (
  { fileName, gcsim, lines, tokens }: CitedFile,
  lineIndex: number,
  citedValue: unknown,
  hitIndex: number | undefined,
  path: string,
): unknown => {
  const field = path.slice(path.lastIndexOf(".") + 1);
  const isActionHit = ACTION_HIT_PATH_REGEX.test(path);
  const lineText = lines[lineIndex] ?? "";
  const resolveName = createGcsimFileResolver(lines);
  const scope = createGoScope(tokens, gcsim.constantMap);
  // A line inside a queued block is read when the block queues it, so an action's hitmark takes the block's delay
  const delay = readGcsimQueueDelay(lines, lineIndex, resolveName);
  if (delay === undefined) return undefined;
  const shift = field === HITMARK_FIELD && isActionHit ? delay : 0;
  const isSeconds = field.endsWith(SECONDS_FIELD_SUFFIX);
  const toRecordValue = (value: number) => (field === GAUGE_FIELD ? value / GCSIM_DURABILITY_PER_GAUGE : value + shift);
  const loop = readGcsimEnclosingLoop(lines, lineIndex, resolveName);
  // An action's hit takes its queue call's hitmark; a named hit is spawned at its own time, so its line gives it
  if (field === HITMARK_FIELD && isActionHit) {
    const queuedHitmarks = readQueuedHitmarks(gcsim.queuedAttacks, fileName, lineIndex + 1, hitIndex, loop?.index);
    if (queuedHitmarks.length > 0)
      return queuedHitmarks.find((value) => checkIsKitValueEqual(value, citedValue)) ?? queuedHitmarks[0];
  }
  // A name resolves to the loop's index first, then to the scope of the position it is read at, the file's assignment
  // And the package's constant, and the action's frame last
  const readExpressionValues = (overrides: (name: string) => GoValue | undefined): number[] =>
    readGcsimLineExpressionStarts(tokens, lineIndex + 1).flatMap((position) => {
      const value = evaluateGoNumber(
        parseGoExpression(tokens, position).expression,
        (name) =>
          overrides(name) ??
          scope.resolveName(name, position) ??
          resolveName(name) ??
          gcsim.constantMap.get(name)?.value ??
          (name === ACTION_FRAME_NAME ? ACTION_FRAME_VALUE : undefined),
      );
      return value === undefined ? [] : [value];
    });
  const readRecordValues = (overrides: (name: string) => GoValue | undefined): number[] => {
    const values = [
      ...readGcsimLineValues(lineText, (name) => overrides(name) ?? resolveName(name)),
      ...readExpressionValues(overrides),
    ].map((value) => toRecordValue(value));
    return isSeconds ? [...values.map((value) => toKitSeconds(value)), ...values] : values;
  };
  if (loop === undefined) {
    const values = readRecordValues(() => undefined);
    return values.find((value) => checkIsKitValueEqual(value, citedValue)) ?? values[0];
  }
  if (loop.count === 0) return undefined;
  const valuesByIndex = Array.from({ length: loop.count }, (_value, index) =>
    readRecordValues((name) => (name === loop.index ? index : undefined)),
  );
  if (hitIndex !== undefined) {
    const hitValues = valuesByIndex[hitIndex] ?? [];
    return hitValues.find((value) => checkIsKitValueEqual(value, citedValue)) ?? hitValues[0];
  }
  // A scalar citation takes the loop's value equal to it, as outside a loop does, else the first index's first value
  if (!Array.isArray(citedValue))
    return valuesByIndex.flat().find((value) => checkIsKitValueEqual(value, citedValue)) ?? valuesByIndex[0]?.[0];
  const positions = Array.from(
    { length: Math.min(...valuesByIndex.map((values) => values.length)) },
    (_value, position) => position,
  );
  for (const position of positions) {
    const array = valuesByIndex.map((values) => values[position] ?? Number.NaN);
    if (checkIsKitValueEqual(array, citedValue)) return array;
  }
  const array = valuesByIndex.map((values) => values[0]);
  return array.every((value) => value !== undefined) ? array : undefined;
};

// The candidates of the overlay's cited values: each cited line of a gcsim character's folder gives a Gcsim candidate with
// That file and line, its value the one the line evaluates to that equals the cited value, or its first value where none
// Does, so a citation the line does not give reads as a difference
export const readGcsimCitedCandidates = (
  overlay: KitOverlay,
  gcsimDirectory: string,
  gcsim: GcsimCharacter,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, entry] of Object.entries(overlay)) {
    if (!("file" in entry) || entry.value === undefined) continue;
    const file = `${GCSIM_CHARACTERS_PATH}/${gcsim.folder}/${entry.file}`;
    const source = readFileSync(join(gcsimDirectory, file), "utf8");
    const lines = source.split("\n");
    // An area is cited by the constructor on its line, whole, with the table cells it reads cited by their rows
    if (typeof entry.value === "object" && entry.value !== null && !Array.isArray(entry.value)) {
      const cited = readCitedArea(lines, readConstructorIndex(lines, entry.line - 1), file, readNormalCounter(path));
      if (cited !== undefined)
        addKitCandidate(candidateMap, path, {
          provenance: { file, line: cited.line, source: KitSource.Gcsim },
          value: cited.area,
        });
      continue;
    }
    const value = readCitedValue(
      { fileName: entry.file, gcsim, lines, tokens: tokenizeGo(source) },
      entry.line - 1,
      entry.value,
      entry.index,
      path,
    );
    if (value === undefined) continue;
    addKitCandidate(candidateMap, path, { provenance: { file, line: entry.line, source: KitSource.Gcsim }, value });
  }
  return candidateMap;
};
