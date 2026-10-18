import type { PartyTeam } from "#src/models/party/PartyTeam";

import { PARTY_TEAM_SIZE } from "#src/services/party/constants";
import { MAX_PARTY_TEAM_NAME_LENGTH } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A team as the save holds it: its members' character ids in slot order, each once, and the name the player gave it
export const partyTeamSaveSchema = z.object({
  characterIds: createUniqueArraySchema(z.int().nonnegative()).max(PARTY_TEAM_SIZE),
  name: z.string().max(MAX_PARTY_TEAM_NAME_LENGTH),
}) satisfies z.ZodType<PartyTeam>;

export type PartyTeamSave = z.infer<typeof partyTeamSaveSchema>;
