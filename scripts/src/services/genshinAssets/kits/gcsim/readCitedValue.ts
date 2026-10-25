import type { CitedFile } from "#src/models/genshinAssets/kits/gcsim/CitedFile";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GCSIM_DURABILITY_PER_GAUGE } from "#src/services/genshinAssets/kits/constants";
import { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGcsimEnclosingLoop } from "#src/services/genshinAssets/kits/gcsim/readGcsimEnclosingLoop";
import { createGcsimFileResolver } from "#src/services/genshinAssets/kits/gcsim/readGcsimFileConstant";
import { readGcsimLineExpressionStarts } from "#src/services/genshinAssets/kits/gcsim/readGcsimLineExpressionStarts";
import { readGcsimLineValues } from "#src/services/genshinAssets/kits/gcsim/readGcsimLineValues";
import { readGcsimQueueDelay } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueueDelay";
import { readQueuedHitmarks } from "#src/services/genshinAssets/kits/gcsim/readQueuedHitmarks";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { toKitSeconds } from "genshin-world";

// The record's hit field measured from the action's start, as BaseKitHitRecord's schema has it: the only field an
// Action's hit adds a queued block's delay to. A duration, an interval or a count is cited as written, in any block
const HITMARK_FIELD = "hitmarkFrames";
// The record's hit field in units of U, which gcsim writes as a durability of GCSIM_DURABILITY_PER_GAUGE to the unit
const GAUGE_FIELD = "gauge";
// The frame the action runs from, `c.Core.F`, which a line's expressions read as zero: the action's start
const ACTION_FRAME_NAME = "c.Core.F";
const ACTION_FRAME_VALUE = 0;
// The suffix of a field that counts seconds, which a count of frames over the frame rate gives
const SECONDS_FIELD_SUFFIX = "Seconds";
// The path of an action's hit, `burst.hits.0.hitmarkFrames` and the like, as opposed to a named hit's, `hits.<name>`
const ACTION_HIT_PATH_REGEX =
  /^(?:normalAttacks|chargedAttack|plunges|plungeCollision|skill\.hits|skillHolds|burst\.hits)\./u;

// The value a cited line gives, in the record's units: its one value equal to the cited value, or its first where none
// Is. A gauge line gives its durability over GCSIM_DURABILITY_PER_GAUGE, in units of U. A seconds field gives its
// Frames over the frame rate, with those converted values first and its frames after them. A queue call's line gives
// First the hitmark readGcsimQueuedAttacks reads for that call, the run's index picking it, then its literal numbers,
// And the value of each expression that starts on it, with its locals, constants and loop index resolved. In a `for`
// Loop, an array of that line's value at each index of the loop, taken at the one expression position whose values
// Equal the cited array, or at the first position where none does; a scalar citation takes the equal value, as outside
// One. A cited entry of a run of hits takes the loop's element at its index, matched as its hit is cited.
export const readCitedValue = (
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
  // A queue call's line offers the hitmark its call queues before its own values, for named and action hits alike
  const queuedHitmarks =
    field === HITMARK_FIELD
      ? readQueuedHitmarks(gcsim.queuedAttacks, fileName, lineIndex + 1, hitIndex, loop?.index)
      : [];
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
    const values = [...queuedHitmarks, ...readRecordValues(() => undefined)];
    return values.find((value) => checkIsKitValueEqual(value, citedValue)) ?? values[0];
  }
  if (loop.count === 0) return undefined;
  const valuesByIndex = Array.from({ length: loop.count }, (_value, index) =>
    readRecordValues((name) => (name === loop.index ? index : undefined)),
  );
  if (hitIndex !== undefined) {
    const hitValues = [...queuedHitmarks, ...(valuesByIndex[hitIndex] ?? [])];
    return hitValues.find((value) => checkIsKitValueEqual(value, citedValue)) ?? hitValues[0];
  }
  // A scalar citation takes the loop's value equal to it, as outside a loop does, else the first index's first value
  if (!Array.isArray(citedValue)) {
    const values = [...queuedHitmarks, ...valuesByIndex.flat()];
    return (
      values.find((value) => checkIsKitValueEqual(value, citedValue)) ?? queuedHitmarks[0] ?? valuesByIndex[0]?.[0]
    );
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
