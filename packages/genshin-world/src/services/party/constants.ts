import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { InputAction } from "genshin-engine";
import { GameTextKey } from "genshin-text";

// The team the world starts deployed with, the Traveler alone as a new player's, whose kits the world's gate reads before
// It opens
export const STARTING_TEAM_CHARACTER_IDS: readonly number[] = [TRAVELER_CHARACTER_ID];
// The most characters a team holds
export const PARTY_TEAM_SIZE = 4;
// The seconds after a switch before the next is allowed
export const PARTY_SWITCH_COOLDOWN_SECONDS = 1;
// The seconds the member on the field plays its fall for, before the player is asked for the next member and may switch
// Provisional: the wiki gives no length for a fall, which the game plays as the fallen animation and voice-over; estimated
// Until a recording of a fall is measured
export const PARTY_FALL_SECONDS = 2;
// The teams every player starts with, Party 1 to 4, which can be renamed but never disbanded
export const DEFAULT_PARTY_TEAM_COUNT = 4;
// The most teams Party Setup keeps, the default ones included
export const PARTY_TEAM_MAX_COUNT = 15;
// The game's name for each of the default teams, Party 1 to 4, which a team keeps until it is renamed
export const DEFAULT_PARTY_TEAM_NAME_GAME_TEXT_KEYS: readonly GameTextKey[] = [
  GameTextKey.PartyDefaultName1,
  GameTextKey.PartyDefaultName2,
  GameTextKey.PartyDefaultName3,
  GameTextKey.PartyDefaultName4,
];
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
// The Moonsign characters a deployed team holds for its Moonsign to rise from Nascent Gleam to Ascendant Gleam
export const ASCENDANT_GLEAM_MOONSIGN_COUNT = 2;
// Ascendant Gleam, lit by a skill or burst of a character outside the Moonsign, gives every party member a reaction
// Bonus to its Lunar damage for 20 seconds, at most 36%, as gcsim (MIT) pkg/simulation/setup.go gives it
// Https://github.com/genshinsim/gcsim/blob/main/pkg/simulation/setup.go
export const ASCENDANT_GLEAM_SECONDS = 20;
export const ASCENDANT_GLEAM_MAXIMUM_REACTION_BONUS = 0.36;
// The id of the status Ascendant Gleam stands as on the character that lit it, which the next one to light it replaces
export const ASCENDANT_GLEAM_STATUS_ID = "ascendantGleam";
// The Verdant Dew a party holds at most. A Lunar-Bloom lets Dew gather for 149 frames after it, and one Dew gathers in
// 146 frames of that, as gcsim (MIT) pkg/core/player/verdantdew.go counts them
// Https://github.com/genshinsim/gcsim/blob/main/pkg/core/player/verdantdew.go
export const VERDANT_DEW_MAXIMUM_COUNT = 3;
export const VERDANT_DEW_GATHERING_SECONDS = 149 / 60;
export const VERDANT_DEW_GATHER_SECONDS = 146 / 60;
// A Lunar-Charged forms the party's cloud for 5.5 seconds, or keeps the one standing for 5.5 seconds again. A new cloud
// First ticks 9 frames on and every 6 frames after, each tick striking every Lunar-Charged enemy within 8 metres of the
// Character on the field, as gcsim (MIT) pkg/reactable/lunarcharged.go ticks it
// Https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/lunarcharged.go
export const LUNAR_CHARGED_CLOUD_SECONDS = 5.5;
export const LUNAR_CHARGED_CLOUD_FIRST_TICK_SECONDS = 9 / 60;
export const LUNAR_CHARGED_CLOUD_TICK_SECONDS = 6 / 60;
export const LUNAR_CHARGED_CLOUD_RADIUS = 8;
// A Lunar-Crystallize counts toward the party's next Moondrift Harmony, up to 6. While fewer than 3 Moondrifts stand
// Within 20 metres of the character on the field, it leaves as many more as make 3 about the enemy it struck, each a
// Metre out, lasting 9 seconds. With 3 standing and 3 counted, it spends the 3 to resonate a Harmony, at most once in
// 37 frames, firing a hit at the enemy 13, 25 and 37 frames on, each flying 10 frames more, and keeping the Moondrifts
// Standing for 9 seconds again, as gcsim (MIT) pkg/reactable/lunarcrystallize.go has it
// Https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/lunarcrystallize.go
export const LUNAR_CRYSTALLIZE_MAXIMUM_COUNT = 6;
export const MOONDRIFT_NEARBY_RADIUS = 20;
export const MOONDRIFT_SECONDS = 9;
export const MOONDRIFT_HARMONY_COUNT = 3;
export const MOONDRIFT_HARMONY_COOLDOWN_SECONDS = 37 / 60;
export const MOONDRIFT_HARMONY_HIT_SECONDS = [13, 25, 37].map((hitmarkFrames) => (hitmarkFrames + 10) / 60);
// Provisional: gcsim leaves its Moondrifts a metre out from the enemy at three even bearings, marking their place a
// Guess, until a recording of a Lunar-Crystallize shows where they stand
// Https://github.com/genshinsim/gcsim/blob/main/pkg/reactable/lunarcrystallize.go
export const MOONDRIFT_OFFSETS = [
  { x: 0, z: 1 },
  { x: Math.sqrt(3) / 2, z: -0.5 },
  { x: -Math.sqrt(3) / 2, z: -0.5 },
];
