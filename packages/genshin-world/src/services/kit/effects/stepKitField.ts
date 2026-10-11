import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";

import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";

// A field's schedule run on by a step: a following field's centre stands where the body on the field stands, then each
// Tick that falls due while that body stands in it runs its tick, and a tick that falls due outside it is passed over
export const stepKitField = (field: KitField, stepSeconds: number, context: KitContext): void => {
  const { position } = context.body;
  if (field.isFollowing) field.centre = { x: position.x, z: position.z };
  field.nextTickSeconds -= stepSeconds;
  while (field.nextTickSeconds <= 0) {
    if (checkIsInKitField(field, position)) field.onTick(context, field.tickIndex);
    field.tickIndex++;
    field.nextTickSeconds += field.tickIntervalSeconds;
  }
};
