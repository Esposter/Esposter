import type { DevCommand } from "#src/models/dev/DevCommand";
import type { Party } from "#src/models/party/Party";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { healPartyMember } from "#src/services/party/healPartyMember";
import { z } from "zod";

// `heal` restores every member of the deployed team to all of its HP, the way a statue's heal does, and answers how many
// It healed. A member who is down stays down, as a heal leaves one
export const createHealCommand = ({ party }: { party: Party }): DevCommand => ({
  args: z.object({}),
  argumentNames: [],
  name: "heal",
  run: () => {
    const characterIds = getDeployedCharacterIds(party);
    // A health share of one is all of a member's HP
    for (const characterId of characterIds) healPartyMember(party, characterId, 1);

    return { ok: true, value: characterIds.length };
  },
});
