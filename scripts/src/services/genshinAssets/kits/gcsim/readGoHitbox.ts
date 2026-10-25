import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { HitboxConstructor } from "#src/models/genshinAssets/kits/gcsim/HitboxConstructor";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { SINGLE_TARGET_HIT_CONSTRUCTOR } from "#src/services/genshinAssets/kits/gcsim/constants";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readArgumentText } from "#src/services/genshinAssets/kits/gcsim/readArgumentText";
import { readCenter } from "#src/services/genshinAssets/kits/gcsim/readCenter";
import { readNumber } from "#src/services/genshinAssets/kits/gcsim/readNumber";
import { readOffset } from "#src/services/genshinAssets/kits/gcsim/readOffset";

const HITBOX_CONSTRUCTORS = new Map<string, HitboxConstructor>([
  ["NewBoxHit", { fanAngle: false, onTarget: false, shape: GcsimHitboxShape.Box }],
  ["NewBoxHitOnTarget", { fanAngle: false, onTarget: true, shape: GcsimHitboxShape.Box }],
  ["NewCircleHit", { fanAngle: false, onTarget: false, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitFanAngle", { fanAngle: true, onTarget: false, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitOnTarget", { fanAngle: false, onTarget: true, shape: GcsimHitboxShape.Circle }],
  ["NewCircleHitOnTargetFanAngle", { fanAngle: true, onTarget: true, shape: GcsimHitboxShape.Circle }],
]);

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
