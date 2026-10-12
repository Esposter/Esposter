import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { AttackArea } from "genshin-world";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { GCSIM_CHARACTERS_PATH } from "#src/services/genshinAssets/kits/constants";
import { readGcsimCitedArea } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedArea";
import { readGcsimEnclosingLoop } from "#src/services/genshinAssets/kits/gcsim/readGcsimEnclosingLoop";
import { createGcsimFileResolver } from "#src/services/genshinAssets/kits/gcsim/readGcsimFileConstant";
import { readGcsimLineValues } from "#src/services/genshinAssets/kits/gcsim/readGcsimLineValues";
import { readGcsimQueueDelay } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueueDelay";
import { substituteGoTableCells } from "#src/services/genshinAssets/kits/gcsim/readGcsimTableCells";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The record's hit field measured from the action's start, as BaseKitHitRecord's schema has it: the only field a queued
// Block's delay is added to, since a duration, an interval or a count is cited as written whatever block its line is in
const HITMARK_FIELD = "hitmarkFrames";

// The most lines an area's constructor may run across, its arguments on the lines under its opening line
const MAX_CONSTRUCTOR_LINES = 12;

// The hit counter a normal attack's table index reads, the action's own number, as its path names `normalAttacks.<n>`
const NORMAL_ATTACK_PATH_REGEX = /^normalAttacks\.(?<counter>\d+)\./u;

const readNormalCounter = (path: string): number | undefined => {
  const counter = NORMAL_ATTACK_PATH_REGEX.exec(path)?.groups?.counter;
  return counter === undefined ? undefined : Number(counter);
};

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

// The area a cited constructor gives, read across its lines, with its line: the row of the table whose cell is the
// Area's radius where the constructor reads a table, else the first table cell it reads, else the constructor's own line.
// A table index that is not evaluable gives no area
const readCitedArea = (
  lines: readonly string[],
  lineIndex: number,
  file: string,
  counter: number | undefined,
): undefined | { area: AttackArea; line: number } => {
  const table = substituteGoTableCells(readConstructorText(lines, lineIndex), lines, counter);
  if (table === undefined) return undefined;
  const area = readGcsimCitedArea(table.text, file);
  if (area === undefined) return undefined;
  const cite = table.cites.find(({ value }) => value === area.radius) ?? table.cites[0];
  return { area, line: cite?.line ?? lineIndex + 1 };
};

// The value a cited line gives: its one value equal to the cited value, or its first where none is. Inside a `for` loop,
// An array of that line's value at each index of the loop, taken at the one expression position whose values equal the
// Cited array, or at the first position where none does. A cited entry of a run of hits takes the loop's element at its own
// Index instead, matched as the one value its hit is cited with
const readCitedValue = (
  lines: readonly string[],
  lineIndex: number,
  citedValue: unknown,
  file: string,
  hitIndex: number | undefined,
  isHitmark: boolean,
): unknown => {
  const lineText = lines[lineIndex] ?? "";
  const resolveName = createGcsimFileResolver(lines);
  // A line inside a queued block is read at the time the block queues it, so a hitmark takes the block's delay
  const delay = readGcsimQueueDelay(lines, lineIndex, resolveName);
  if (delay === undefined) return undefined;
  const shift = isHitmark ? delay : 0;
  const loop = readGcsimEnclosingLoop(lines, lineIndex, resolveName);
  if (loop === undefined) {
    const values = readGcsimLineValues(lineText, resolveName).map((value) => value + shift);
    return values.find((value) => checkIsKitValueEqual(value, citedValue)) ?? values[0];
  }
  if (loop.count === 0) return undefined;
  const valuesByIndex = Array.from({ length: loop.count }, (_value, index) =>
    readGcsimLineValues(lineText, (name) => (name === loop.index ? index : resolveName(name))).map(
      (value) => value + shift,
    ),
  );
  if (hitIndex !== undefined) {
    const hitValues = valuesByIndex[hitIndex] ?? [];
    return hitValues.find((value) => checkIsKitValueEqual(value, citedValue)) ?? hitValues[0];
  }
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
  folder: string,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, entry] of Object.entries(overlay)) {
    if (!("file" in entry) || entry.value === undefined) continue;
    const file = `${GCSIM_CHARACTERS_PATH}/${folder}/${entry.file}`;
    const lines = readFileSync(join(gcsimDirectory, file), "utf8").split("\n");
    // An area is cited by the constructor on its line, whole, with the table cells it reads cited by their rows
    if (typeof entry.value === "object" && entry.value !== null && !Array.isArray(entry.value)) {
      const cited = readCitedArea(lines, entry.line - 1, file, readNormalCounter(path));
      if (cited !== undefined)
        addKitCandidate(candidateMap, path, {
          provenance: { file, line: cited.line, source: KitSource.Gcsim },
          value: cited.area,
        });
      continue;
    }
    const isHitmark = path.endsWith(`.${HITMARK_FIELD}`);
    const value = readCitedValue(lines, entry.line - 1, entry.value, file, entry.index, isHitmark);
    if (value === undefined) continue;
    addKitCandidate(candidateMap, path, { provenance: { file, line: entry.line, source: KitSource.Gcsim }, value });
  }
  return candidateMap;
};
