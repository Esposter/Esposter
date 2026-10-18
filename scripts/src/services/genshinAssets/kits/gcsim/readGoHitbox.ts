import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readArgumentStarts } from "#src/services/genshinAssets/kits/gcsim/readArgumentStarts";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// The layout of a `combat` hitbox constructor's arguments: an on-target one takes its target first, a source one its
// Source then its centre, each then its offset, its size (a circle's radius, a box's width and height) and a fan angle
// Where it has one
interface HitboxConstructor {
  fanAngle: boolean;
  onTarget: boolean;
  shape: GcsimHitboxShape;
}

const HITBOX_CONSTRUCTORS = new Map<string, HitboxConstructor>([
  ["NewBoxHit", { fanAngle: false, onTarget: false, shape: GcsimHitboxShape.Box }],
  ["NewBoxHitOnTarget", { fanAngle: false, onTarget: true, shape: GcsimHitboxShape.Box }],
  ["NewCircleHit", { fanAngle: false, onTarget: false, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitFanAngle", { fanAngle: true, onTarget: false, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitOnTarget", { fanAngle: false, onTarget: true, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitOnTargetFanAngle", { fanAngle: true, onTarget: true, shape: GcsimHitboxShape.Circle }],
]);

// The centre a source or target argument names, the player or the primary target by its getter, else none
const CENTER_GETTERS: [string, GcsimHitboxCenter][] = [
  ["Combat.Player()", GcsimHitboxCenter.Player],
  ["Combat.PrimaryTarget()", GcsimHitboxCenter.PrimaryTarget],
];

const readArgumentText = (tokens: readonly GoToken[], start: number): string => {
  const end = parseGoExpression(tokens, start).end;
  return tokens
    .slice(start, end)
    .filter(({ kind }) => kind !== GoTokenKind.Newline)
    .map(({ text }) => text)
    .join("");
};

const readCenter = (text: string): GcsimHitboxCenter | undefined =>
  CENTER_GETTERS.find(([getter]) => text.endsWith(getter))?.[1];

// The offset a `info.Point{X: x, Y: y}` literal gives, forward as its Y, or none for a nil argument. Undefined where the
// Argument is any other form
const readOffset = (
  tokens: readonly GoToken[],
  start: number,
  resolveName: (name: string) => GoValue | undefined,
): [number, number] | null | undefined => {
  if (readArgumentText(tokens, start) === "nil") return null;
  let position = start;
  while (tokens[position]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "."))
    position += 2;
  if (tokens[position]?.text !== "Point" || !checkIsGoPunctuation(tokens[position + 1], "{")) return undefined;
  const offset: [number, number] = [0, 0];
  position += 2;
  while (tokens[position] !== undefined && !checkIsGoPunctuation(tokens[position], "}")) {
    const key = tokens[position];
    if (key?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[position + 1], ":")) return undefined;
    const value = readGoNumber(evaluateGoExpression(parseGoExpression(tokens, position + 2).expression, resolveName));
    if (typeof value !== "number" || (key.text !== "X" && key.text !== "Y")) return undefined;
    offset[key.text === "X" ? 0 : 1] = value;
    position = parseGoExpression(tokens, position + 2).end;
    if (checkIsGoPunctuation(tokens[position], ",")) position++;
  }
  return offset;
};

const readNumber = (
  tokens: readonly GoToken[],
  start: number,
  resolveName: (name: string) => GoValue | undefined,
): number | undefined => readGoNumber(evaluateGoExpression(parseGoExpression(tokens, start).expression, resolveName));

// The hitbox a queue call's attack pattern is written as, `combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 2)`
// And its kin, in gcsim's shape and centre terms: a circle or box on the player, or on the primary target, with its
// Offset, radius or size and fan angle. A constructor centred on any other target, or with a size or offset the
// Constants do not give a number, has no hitbox. The line is the constructor's
export const readGoHitbox = (
  tokens: readonly GoToken[],
  start: number,
  resolveName: (name: string) => GoValue | undefined,
  file: string,
): GcsimHitbox | undefined => {
  let position = start;
  while (tokens[position]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "."))
    position += 2;
  const constructorToken = tokens[position];
  const hitboxConstructor = HITBOX_CONSTRUCTORS.get(constructorToken?.text ?? "");
  if (
    constructorToken === undefined ||
    hitboxConstructor === undefined ||
    !checkIsGoPunctuation(tokens[position + 1], "(")
  )
    return undefined;
  const argumentStarts = readArgumentStarts(tokens, position + 1);
  const { fanAngle: hasFanAngle, onTarget, shape } = hitboxConstructor;
  const sizeCount = shape === GcsimHitboxShape.Circle ? 1 : 2;
  const offsetIndex = onTarget ? 1 : 2;
  const sizeStart = offsetIndex + 1;
  const fanIndex = sizeStart + sizeCount;
  if (argumentStarts.length !== fanIndex + (hasFanAngle ? 1 : 0)) return undefined;
  const [sourceStart, centerStart] = argumentStarts;
  if (sourceStart === undefined) return undefined;
  const sourceCenter = readCenter(readArgumentText(tokens, sourceStart));
  // A source-centred constructor is centred on its source, unless its centre argument names a centre of its own
  const centerText = onTarget || centerStart === undefined ? "nil" : readArgumentText(tokens, centerStart);
  const center = centerText === "nil" ? sourceCenter : readCenter(centerText);
  const offsetStart = argumentStarts[offsetIndex];
  const offset = offsetStart === undefined ? undefined : readOffset(tokens, offsetStart, resolveName);
  if (center === undefined || offset === undefined) return undefined;
  // Only a circle or box on the player takes an offset: a target's centre is the target itself
  if (
    center === GcsimHitboxCenter.PrimaryTarget
      ? offset !== null
      : !onTarget && sourceCenter !== GcsimHitboxCenter.Player
  )
    return undefined;
  const sizes: number[] = [];
  for (const sizeArgumentStart of argumentStarts.slice(sizeStart, fanIndex)) {
    const size = readNumber(tokens, sizeArgumentStart, resolveName);
    if (size === undefined) return undefined;
    sizes.push(size);
  }
  const fanAngle = hasFanAngle ? readNumber(tokens, argumentStarts[fanIndex] ?? -1, resolveName) : undefined;
  if (hasFanAngle && fanAngle === undefined) return undefined;
  const hitbox: GcsimHitbox = { center, file, line: constructorToken.line, name: constructorToken.text, shape };
  if (offset !== null) hitbox.offset = offset;
  if (shape === GcsimHitboxShape.Circle) hitbox.radius = sizes[0];
  else hitbox.box = [sizes[0] ?? 0, sizes[1] ?? 0];
  if (fanAngle !== undefined) hitbox.fanAngle = fanAngle;
  return hitbox;
};
