import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// The layout of a `combat` hitbox constructor's arguments: an on-target one takes its target first, a source one its
// Source then its centre, each then its offset, its size (a circle's radius, a box's width and height) and a fan angle
// Where it has one
interface HitboxConstructor {
  fanAngle: boolean;
  onTarget: boolean;
  shape: GcsimHitboxShape;
}

// The constructor of a hit gcsim gives its target alone, `combat.NewSingleTargetHit(e.Key())`, with no reach beyond it
export const SINGLE_TARGET_HIT_CONSTRUCTOR = "NewSingleTargetHit";

const HITBOX_CONSTRUCTORS = new Map<string, HitboxConstructor>([
  ["NewBoxHit", { fanAngle: false, onTarget: false, shape: GcsimHitboxShape.Box }],
  ["NewBoxHitOnTarget", { fanAngle: false, onTarget: true, shape: GcsimHitboxShape.Box }],
  ["NewCircleHit", { fanAngle: false, onTarget: false, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitFanAngle", { fanAngle: true, onTarget: false, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitOnTarget", { fanAngle: false, onTarget: true, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitOnTargetFanAngle", { fanAngle: true, onTarget: true, shape: GcsimHitboxShape.Circle }],
]);

// The centre a source or target argument names by its getter: the player or the primary target, read through its
// `.Pos()` as well
const CENTER_GETTERS: [string, GcsimHitboxCenter][] = [
  ["Combat.Player()", GcsimHitboxCenter.Player],
  ["Combat.Player().Pos()", GcsimHitboxCenter.Player],
  ["Combat.PrimaryTarget()", GcsimHitboxCenter.PrimaryTarget],
  ["Combat.PrimaryTarget().Pos()", GcsimHitboxCenter.PrimaryTarget],
];

// A bare name or a field of one, `stelePos` or `c.qPos`, which a constructor may name a place by
const PLACE_REGEX = /^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/u;

const readArgumentText = (tokens: readonly GoToken[], start: number): string => {
  const end = parseGoExpression(tokens, start).end;
  return tokens
    .slice(start, end)
    .filter(({ kind }) => kind !== GoTokenKind.Newline)
    .map(({ text }) => text)
    .join("");
};

const readGetterCenter = (text: string): GcsimHitboxCenter | undefined =>
  CENTER_GETTERS.find(([getter]) => text.endsWith(getter))?.[1];

// The centre a source or target argument names: its getter, else for a place its name is bound to by a getter, else
// The place itself, the code computes it somewhere a getter does not give. Any other call names none
const readCenter = (
  tokens: readonly GoToken[],
  start: number,
  resolveAssignment: (name: string) => number | undefined,
): GcsimHitboxCenter | undefined => {
  const text = readArgumentText(tokens, start);
  if (!PLACE_REGEX.test(text)) return readGetterCenter(text);
  const valueStart = resolveAssignment(text);
  const boundCenter = valueStart === undefined ? undefined : readGetterCenter(readArgumentText(tokens, valueStart));
  return boundCenter ?? GcsimHitboxCenter.Position;
};

// The offset a `info.Point{X: x, Y: y}` literal gives, forward as its Y, or none for a nil argument. A bare name is read
// At the literal its dominating assignment gives. Undefined where the argument is any other form
const readOffset = (
  tokens: readonly GoToken[],
  start: number,
  resolveName: (name: string) => GoValue | undefined,
  resolveAssignment: (name: string) => number | undefined,
): [number, number] | null | undefined => {
  const text = readArgumentText(tokens, start);
  if (text === "nil") return null;
  const valueStart = PLACE_REGEX.test(text) ? resolveAssignment(text) : start;
  if (valueStart === undefined) return undefined;
  let position = valueStart;
  while (tokens[position]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "."))
    position += 2;
  if (tokens[position]?.text !== "Point" || !checkIsGoPunctuation(tokens[position + 1], "{")) return undefined;
  const offset: [number, number] = [0, 0];
  position += 2;
  while (tokens[position] !== undefined && !checkIsGoPunctuation(tokens[position], "}")) {
    const key = tokens[position];
    if (key?.kind !== GoTokenKind.Identifier || !checkIsGoPunctuation(tokens[position + 1], ":")) return undefined;
    const value = evaluateGoNumber(parseGoExpression(tokens, position + 2).expression, resolveName);
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
): number | undefined => evaluateGoNumber(parseGoExpression(tokens, start).expression, resolveName);

// The hitbox a queue call's attack pattern is written as, `combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 2)`
// And its kin, in gcsim's shape and centre terms: a circle or box on the player, on the primary target or on a place
// The code computes, with its offset, radius or size and fan angle. A constructor with a size or offset the constants
// Do not give a number, or centred on a call that is no getter, has no hitbox. The line is the constructor's
export const readGoHitbox = (
  tokens: readonly GoToken[],
  start: number,
  resolveName: (name: string) => GoValue | undefined,
  file: string,
  resolveAssignment: (name: string) => number | undefined,
): GcsimHitbox | undefined => {
  let position = start;
  while (tokens[position]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[position + 1], "."))
    position += 2;
  const constructorToken = tokens[position];
  const call = parseGoExpression(tokens, start).expression;
  if (constructorToken?.text === SINGLE_TARGET_HIT_CONSTRUCTOR)
    return call.kind === GoExpressionKind.Call && call.parameterStarts.length === 1
      ? {
          center: GcsimHitboxCenter.PrimaryTarget,
          file,
          line: constructorToken.line,
          name: constructorToken.text,
          radius: 0,
          shape: GcsimHitboxShape.Circle,
        }
      : undefined;
  const hitboxConstructor = HITBOX_CONSTRUCTORS.get(constructorToken?.text ?? "");
  if (constructorToken === undefined || hitboxConstructor === undefined) return undefined;
  if (call.kind !== GoExpressionKind.Call) return undefined;
  const argumentStarts = call.parameterStarts;
  const { fanAngle: hasFanAngle, onTarget, shape } = hitboxConstructor;
  const sizeCount = shape === GcsimHitboxShape.Circle ? 1 : 2;
  const offsetIndex = onTarget ? 1 : 2;
  const sizeStart = offsetIndex + 1;
  const fanIndex = sizeStart + sizeCount;
  if (argumentStarts.length !== fanIndex + (hasFanAngle ? 1 : 0)) return undefined;
  const [sourceStart, centerStart] = argumentStarts;
  if (sourceStart === undefined) return undefined;
  const sourceCenter = readCenter(tokens, sourceStart, resolveAssignment);
  // A source-centred constructor is centred on its source, unless its centre argument names a centre of its own
  const center =
    centerStart === undefined || onTarget || readArgumentText(tokens, centerStart) === "nil"
      ? sourceCenter
      : readCenter(tokens, centerStart, resolveAssignment);
  const offsetStart = argumentStarts[offsetIndex];
  const offset =
    offsetStart === undefined ? undefined : readOffset(tokens, offsetStart, resolveName, resolveAssignment);
  if (center === undefined || offset === undefined) return undefined;
  // A circle on the player or the target takes its offset, which moves its centre as a body circle's does; a box on the
  // Target keeps none
  if (
    center === GcsimHitboxCenter.PrimaryTarget
      ? offset !== null && shape === GcsimHitboxShape.Box
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
