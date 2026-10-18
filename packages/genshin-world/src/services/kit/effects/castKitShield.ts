import type { KitContext } from "#src/models/kit/KitContext";
import type { KitShield } from "#src/models/kit/KitShield";
import type { Except } from "type-fest";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";

// A shield a character casts onto the team's effects, recast over the one it holds as addKitEffect recasts it, told to
// The deployed team's kits once it stands, as gcsim's shield handler emits OnShielded from its Add
// (pkg/core/player/shield/handler.go:81), and returned for a kit that reads it again
export const castKitShield = (
  context: KitContext,
  characterId: number,
  shield: Except<KitShield, "characterId" | "kind">,
): KitShield => {
  const kitShield: KitShield = { ...shield, characterId, kind: "shield" };
  addKitEffect(context.kitEffectState, kitShield);
  emitKitEvent({ kind: KitEventKind.ShieldCast, shield: kitShield }, context);
  return kitShield;
};
