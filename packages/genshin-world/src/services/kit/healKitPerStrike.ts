import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";

// The striker heals itself by an amount of HP each time a hit's onStrike runs, which it does once for each enemy the hit
// Strikes. Heals are capped at a maximum per cast: the heals a cast has given are a kit resource under the id, which the
// Cast's start clears with spendKitResource, so a strike past the last heal of a cast heals nothing
export const healKitPerStrike = (
  context: KitContext,
  { combatant }: KitStrike,
  { health, maximumHeals, resourceId }: { health: number; maximumHeals: number; resourceId: string },
): void => {
  const { characterId } = combatant;
  if (countKitResource(context.kitEffectState.effects, characterId, resourceId) >= maximumHeals) return;
  gainKitResource(context.kitEffectState, characterId, resourceId, 1, maximumHeals);
  changeKitMemberHealth(context, combatant, characterId, health);
};
