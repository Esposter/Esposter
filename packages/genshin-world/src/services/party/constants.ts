import { InputAction } from "genshin-engine";

// The most characters a team holds
export const PARTY_TEAM_SIZE = 4;
// The seconds after a switch before the next is allowed
export const PARTY_SWITCH_COOLDOWN_SECONDS = 1;
// The teams every player starts with, Party 1 to 4, which can be renamed but never disbanded
export const DEFAULT_PARTY_TEAM_COUNT = 4;
// The most teams Party Setup keeps, the default ones included
export const PARTY_TEAM_MAX_COUNT = 15;
// The name an added team is given until it is renamed
// Provisional: the game's own words for it, to be taken from its text id in the decoded client
export const PARTY_ADDED_TEAM_NAME = "Team Standing By";
// The members of one element a full team needs to give that element's resonance
export const PARTY_RESONANCE_MEMBER_COUNT = 2;
// The CRIT Rate Shattering Ice adds against an enemy Frozen or affected by Cryo, as the Elemental Resonance page of the
// Genshin Impact Wiki gives it
export const SHATTERING_ICE_CRITICAL_RATE_BONUS = 0.15;
// The DMG dealt Enduring Rock adds to a hit while a shield protects the team, and the Geo RES each enemy it strikes
// Loses for its seconds, as the Elemental Resonance page of the Genshin Impact Wiki gives them
export const ENDURING_ROCK_DAMAGE_BONUS = 0.15;
export const ENDURING_ROCK_RESISTANCE_REDUCTION = 0.2;
export const ENDURING_ROCK_SECONDS = 15;
// The id of the status Enduring Rock gives each enemy it strikes, which the next hit under it restarts
export const ENDURING_ROCK_STATUS_ID = "enduringRock";
// The seconds Sprawling Greenery's timed Elemental Mastery lasts on each party member, as the Elemental Resonance page
// Of the Genshin Impact Wiki gives it
export const SPRAWLING_GREENERY_SECONDS = 6;
// The factor a skill's cooldown is multiplied by under Impetuous Winds, as the Elemental Resonance page of the Genshin
// Impact Wiki gives it
export const IMPETUOUS_WINDS_SKILL_COOLDOWN_MULTIPLIER = 0.95;
// The factor the walking, running, sprinting and dashing speeds are multiplied by under Impetuous Winds' Movement SPD,
// Which the Movement Speed page of the Genshin Impact Wiki lists them among
export const IMPETUOUS_WINDS_MOVEMENT_SPEED_MULTIPLIER = 1.1;
// The factor the stamina a kit's action or a step spends is multiplied by under Impetuous Winds, as the Team Bonus
// Page of the Genshin Impact Wiki gives it
export const IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER = 0.85;
// The actions switching to each slot of the deployed team, its first slot first: 1 to 4, and a pad's directions
export const PARTY_MEMBER_INPUT_ACTIONS: readonly InputAction[] = [
  InputAction.SwitchToPartyMember1,
  InputAction.SwitchToPartyMember2,
  InputAction.SwitchToPartyMember3,
  InputAction.SwitchToPartyMember4,
];
// The actions switching to each slot of the deployed team and using its Elemental Burst: Left Alt with 1 to 4
export const PARTY_MEMBER_BURST_INPUT_ACTIONS: readonly InputAction[] = [
  InputAction.SwitchToPartyMemberAndBurst1,
  InputAction.SwitchToPartyMemberAndBurst2,
  InputAction.SwitchToPartyMemberAndBurst3,
  InputAction.SwitchToPartyMemberAndBurst4,
];
// The share of its Max HP each member of a team that has all fallen comes back with, at the nearest waypoint
export const REVIVE_HEALTH_SHARE = 0.35;
// The share of its Max HP every member of the team loses when the one on the field drowns
export const DROWN_HEALTH_SHARE_LOSS = 0.1;
