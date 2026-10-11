import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { createParty } from "#src/services/party/createParty";
import { describe } from "vitest";

// The context a kit's step runs with: its combatant on the field, alone in the deployed team, standing at the origin
// With no effects, each part replaced by the one given
export const createKitStepContext = (combatant: Combatant, context: Partial<KitStepContext> = {}): KitStepContext => ({
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant,
  kitEffectState: { effects: [] },
  party: createParty([combatant.characterId]),
  ...context,
});

describe.todo("createKitStepContext");
