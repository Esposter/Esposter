import { partyTeamSaveSchema } from "#src/models/party/PartyTeamSave";
import { DEFAULT_PARTY_TEAM_COUNT, PARTY_TEAM_MAX_COUNT } from "#src/services/party/constants";
import { MAX_CHARACTER_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The party as the save holds it: the teams Party Setup set up, the one deployed, the index of its member on the field
// And the characters who are down, by id. A member's HP, energy and cooldowns are not held, so a reload brings each
// Standing member back at full HP with its energy and cooldowns none. The member on the field must be in the deployed team
export const partySaveSchema = z
  .object({
    activeIndex: z.int().nonnegative(),
    deployedTeamIndex: z.int().nonnegative(),
    downCharacterIds: createUniqueArraySchema(z.int().nonnegative()).max(MAX_CHARACTER_COUNT),
    teams: z.array(partyTeamSaveSchema).min(DEFAULT_PARTY_TEAM_COUNT).max(PARTY_TEAM_MAX_COUNT),
  })
  .refine(
    ({ activeIndex, deployedTeamIndex, teams }) => (teams[deployedTeamIndex]?.characterIds.length ?? 0) > activeIndex,
    "The member on the field is not in the deployed team",
  );

export type PartySave = z.infer<typeof partySaveSchema>;
