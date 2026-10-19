import type { ConstantLoop } from "#src/models/genshinAssets/kits/gcsim/ConstantLoop";
import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { GO_MAX_LOOP_ITERATIONS } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// The blank identifier, which a loop's variable may be and which names no value an iteration carries
const GO_BLANK_IDENTIFIER = "_";

// The rows of a talent variable's table: one more than the highest row any of its leaves names. A variable the config
// Names as one reference is one row of levels rather than a list of rows, so it has none
const readTalentRowCount = (config: GcsimConfig, name: string): number | undefined => {
  const leaves = config.talentVariables.find((variable) => variable.name === name)?.leaves;
  if (leaves === undefined || leaves.length === 0 || leaves.some(({ path }) => path.length === 0)) return undefined;
  return Math.max(...leaves.map(({ path: [row = 0] }) => row + 1));
};

// The elements a range runs once each over: a constant slice of numbers, else the rows of a talent table, which no
// Constant gives and whose rows are not numbers. Undefined where the range is neither
const readRangedElements = (
  slice: GoValue | undefined,
  rowCount: number | undefined,
): readonly unknown[] | undefined => {
  if (Array.isArray(slice)) return slice.every((element) => typeof element === "number") ? slice : undefined;
  return rowCount === undefined ? undefined : Array.from({ length: rowCount });
};

// The `for` loop opening at the position when it ranges over a constant slice of numbers, as in
// `for i, delay := range burstHitmarks {`, or over a talent table, as in `for i, mult := range burstWhiteInitial {`,
// Which the config gives one row per entry it lists. Its iterations are the indexes, with its elements as the value
// Variable when they are numbers, and its body's braces, else Undefined
export const readSliceRangeLoop = (
  tokens: readonly GoToken[],
  forPosition: number,
  resolveName: (name: string) => GoValue | undefined,
  config: GcsimConfig,
): ConstantLoop | undefined => {
  const indexToken = tokens[forPosition + 1];
  const isValueNamed = checkIsGoPunctuation(tokens[forPosition + 2], ",");
  const valueToken = isValueNamed ? tokens[forPosition + 3] : undefined;
  const operatorPosition = forPosition + (isValueNamed ? 4 : 2);
  if (
    indexToken?.kind !== GoTokenKind.Identifier ||
    (isValueNamed && valueToken?.kind !== GoTokenKind.Identifier) ||
    !checkIsGoPunctuation(tokens[operatorPosition], ":=") ||
    tokens[operatorPosition + 1]?.text !== "range"
  )
    return undefined;
  // The slice is named alone, its brace opening the body rather than a composite literal
  const sliceToken = tokens[operatorPosition + 2];
  const sliceName = sliceToken?.kind === GoTokenKind.Identifier ? sliceToken.text : undefined;
  const slice = sliceName === undefined ? undefined : resolveName(sliceName);
  const rowCount = slice === undefined && sliceName !== undefined ? readTalentRowCount(config, sliceName) : undefined;
  const bodyStart = operatorPosition + 3;
  const elements = readRangedElements(slice, rowCount);
  if (
    !checkIsGoPunctuation(tokens[bodyStart], "{") ||
    elements === undefined ||
    elements.length > GO_MAX_LOOP_ITERATIONS
  )
    return undefined;
  const bodyEnd = findClosing(tokens, bodyStart, "{", "}");
  return bodyEnd === undefined
    ? undefined
    : {
        bodyEnd,
        bodyStart,
        iterations: elements.map((element, index) => {
          const iteration = new Map<string, number>();
          if (indexToken.text !== GO_BLANK_IDENTIFIER) iteration.set(indexToken.text, index);
          // A row is no number, so a range over rows binds its index alone
          if (typeof element === "number" && valueToken !== undefined && valueToken.text !== GO_BLANK_IDENTIFIER)
            iteration.set(valueToken.text, element);
          return iteration;
        }),
      };
};
