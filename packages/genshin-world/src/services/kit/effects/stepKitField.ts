import type { KitContext } from "#src/models/kit/KitContext";
import type { KitField } from "#src/models/kit/KitField";

import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";

// A field's schedule run on by a step: a following field's centre is moved, in place, to where the body on the field
// Stands, its step hook runs, if it has one, then each tick that falls due while that body stands in it runs its tick,
// And a tick that falls due outside it is passed over. A centre is the field's own, never shared, as each kit builds it
// From the point it casts at
export const stepKitField = (field: KitField, stepSeconds: number, context: KitContext): void => {
  const { position } = context.body;
  if (field.isFollowing) {
    field.centre.x = position.x;
    field.centre.z = position.z;
  }
  field.onStep?.(context, field);
  field.nextTickSeconds -= stepSeconds;
  while (field.nextTickSeconds <= 0) {
    if (checkIsInKitField(field, position)) field.onTick(context, field.tickIndex);
    field.tickIndex++;
    field.nextTickSeconds += field.tickIntervalSeconds;
  }
};
