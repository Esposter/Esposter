import type { InventorySave } from "#src/models/inventory/InventorySave";
import type { PartySave } from "#src/models/party/PartySave";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import achievementCount from "#src/data/achievements/achievementCount.json";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { MAX_MINOR_AFFIX_COUNT } from "#src/services/artifact/constants";
import { COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { INVENTORY_KIND_LIMIT, MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import { EMPTY_CURRENCIES } from "#src/services/inventory/constants";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { toArchiveProgressSave } from "#src/services/save/toArchiveProgressSave";
import {
  DEFAULT_PARTY_TEAM_COUNT,
  PARTY_TEAM_MAX_COUNT,
  PARTY_TEAM_SIZE,
  STARTING_TEAM_CHARACTER_IDS,
} from "#src/services/party/constants";
import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { InitialBannerKindWishPityMap } from "#src/services/wish/InitialBannerKindWishPityMap";
import { BannerKind } from "genshin-interface/save";

// A save's ids are the game's own, short and fixed, so one bound serves every id a slice holds
export const MAX_SAVE_ID_LENGTH = 64;
// The longest name a save holds for the Traveler. The game's own limit on the name is unread, so this only bounds a
// Crafted save
export const MAX_TRAVELER_NAME_LENGTH = 32;
// The longest name a save holds for a party team, bounded as the Traveler's name is: the game's own limit on a team's
// Name is unread, so this only bounds a crafted save
export const MAX_PARTY_TEAM_NAME_LENGTH = 32;
// The most of each list a save may hold: a landmark or quest is unique, and a player holds fewer characters
// Than the bound
export const MAX_UNLOCKED_LANDMARK_COUNT = 512;
// The chests a player opens once each, so the bound is every chest the world's regions hold at once with room to spare
export const MAX_OPENED_CHEST_COUNT = 4096;
// The Oculi a player finds once each, across every region the game has, so the bound is the whole map's with room to
// Spare
export const MAX_FOUND_OCULUS_COUNT = 4096;
// The Seelies a player settles in their courts once each, so the bound is the map's 547 Seelie marks on the ground in the
// Mapped regions, counted from the official map's point list the puzzles build places on 2026-10-18
export const MAX_SETTLED_SEELIE_COUNT = 547;
// The puzzles a player solves once each, so the bound is the map's 632 Time Trial Challenge marks and 200 Elemental
// Monument marks on the ground in the mapped regions, counted from the same point list on the same day
export const MAX_SOLVED_PUZZLE_COUNT = 832;
// The regions a player's statues are held in, one entry each, bounded by the game's nations and borderlands with room
// To spare
export const MAX_STATUE_REGION_COUNT = 32;
// The entries a section of the Archive holds open, one each, bounded by the codex's largest section with room to spare
export const MAX_ARCHIVE_ENTRY_COUNT = 4096;
// The Living Beings the Archive counts defeats of, one entry each, bounded by the codex's rows with room to spare
export const MAX_ARCHIVE_KILL_COUNT = 4096;
export const MAX_QUEST_COUNT = 512;
export const MAX_OBJECTIVE_COUNT = 16;
export const MAX_CHARACTER_COUNT = 512;
// The draws the wish history keeps, the newest of those within its window and never more than this, so a year of draws is
// Bounded
export const MAX_WISH_HISTORY_COUNT = 10_000;
// The bench's recipes are the combine table's rows, each named by its id once in the learned list and once in the counts
export const MAX_CRAFTING_RECIPE_COUNT = 512;
// The game's achievement table keeps this many achievements, counted by `genshin:assets achievements` into the
// World's data
export const MAX_ACHIEVEMENT_COUNT: number = achievementCount.count;
// The bag holds up to its kinds of item beside its rooms for weapons, artifacts and furnishings, where each piece is
// An entry of its own, so its entries are at most the kinds plus the rooms the wiki's Inventory page gives
export const MAX_INVENTORY_ITEM_COUNT: number =
  INVENTORY_KIND_LIMIT + Object.values(ItemCategoryRoomMap).reduce((total, room) => total + (room ?? 0), 0);
// The longest instant a save holds: Temporal's own string at its nanosecond, Z-suffixed, which the schemas bound to
// This length
const MAX_SAVE_INSTANT = "9999-12-31T23:59:59.999999999Z";
export const MAX_SAVE_INSTANT_LENGTH: number = MAX_SAVE_INSTANT.length;
// The longest number and id a save holds: the largest safe integer every integer's schema admits, and an id at
// Its bound
const MAX_SAVE_NUMBER = Number.MAX_SAFE_INTEGER;
const MAX_SAVE_ID = "x".repeat(MAX_SAVE_ID_LENGTH);
// The serialized length of a record's entry at its longest, its key at the id bound, with the comma that follows it
const getRecordEntryLength = (value: unknown): number => JSON.stringify({ [MAX_SAVE_ID]: value }).length - 1;
// The serialized length of a list's entry at its longest, with the comma that follows it
const getListEntryLength = (value: unknown): number => JSON.stringify(value).length + 1;
// The longest member of a string-valued enum, so an entry holding any member is counted at the longest it can be
const getLongestMember = (members: readonly string[]): string =>
  members.reduce((longest, member) => (member.length > longest.length ? member : longest));
const LONGEST_ATTRIBUTE = getLongestMember(Object.values(Attribute));
const LONGEST_ARTIFACT_SLOT = getLongestMember(Object.values(ArtifactSlot));
const LONGEST_BANNER_KIND = getLongestMember(Object.values(BannerKind));
// A character at its longest: every number at its largest, every enum at its longest member, an attribute's value at the
// Longest a finite number is written, and every list at its cap
const LONGEST_CHARACTER_SAVE = {
  artifacts: Array.from({ length: Object.values(ArtifactSlot).length }, () => ({
    experience: MAX_SAVE_NUMBER,
    isLocked: true,
    level: MAX_SAVE_NUMBER,
    mainAffix: LONGEST_ATTRIBUTE,
    minorAffixes: Array.from({ length: MAX_MINOR_AFFIX_COUNT }, () => ({
      attribute: LONGEST_ATTRIBUTE,
      value: -Number.MAX_VALUE,
    })),
    rarity: MAX_SAVE_NUMBER,
    setId: MAX_SAVE_NUMBER,
    slot: LONGEST_ARTIFACT_SLOT,
  })),
  ascension: MAX_SAVE_NUMBER,
  constellationCount: CONSTELLATION_COUNT,
  copyCount: MAX_SAVE_NUMBER,
  id: MAX_SAVE_NUMBER,
  level: MAX_SAVE_NUMBER,
  stellaFortunaCount: MAX_SAVE_NUMBER,
  talentLevels: Object.fromEntries(Object.values(CombatTalent).map((combatTalent) => [combatTalent, MAX_SAVE_NUMBER])),
  weapon: {
    ascension: MAX_SAVE_NUMBER,
    experience: MAX_SAVE_NUMBER,
    id: MAX_SAVE_NUMBER,
    level: MAX_SAVE_NUMBER,
    refinement: MAX_WEAPON_REFINEMENT,
  },
};
// The save at its longest outside its collections: every number at its largest, every instant at its longest and every
// Collection empty, so the ceiling below adds only the entries of each collection
const SKELETON_GENSHIN_SAVE_LENGTH = JSON.stringify({
  achievements: {},
  adventureExp: MAX_SAVE_NUMBER,
  characters: [],
  commissionDay: { claimedCommissionIds: [], dealtAt: MAX_SAVE_INSTANT, dealtCommissions: [] },
  companionshipExp: {},
  crafting: { craftedCounts: {}, learnedRecipeIds: [] },
  inventory: { equippedGadgetItemId: MAX_SAVE_NUMBER, items: [], nextId: MAX_SAVE_NUMBER },
  offerings: { frostbearingTree: { heldCount: MAX_SAVE_NUMBER, level: MAX_SAVE_NUMBER } },
  openedChests: [],
  party: { activeIndex: MAX_SAVE_NUMBER, deployedTeamIndex: MAX_SAVE_NUMBER, downCharacterIds: [], teams: [] },
  puzzles: { settledSeelieIds: [], solvedPuzzleIds: [] },
  quests: {},
  reputation: { exp: MAX_SAVE_NUMBER, level: MAX_SAVE_NUMBER },
  statues: { foundOculusIds: [], regions: {} },
  travelerName: "x".repeat(MAX_TRAVELER_NAME_LENGTH),
  unlockedLandmarks: [],
  wallet: {
    currencies: Object.fromEntries(Object.values(Currency).map((currency) => [currency, MAX_SAVE_NUMBER])),
    originalResinChangedAt: MAX_SAVE_INSTANT,
    primogemResinRefillCount: MAX_SAVE_NUMBER,
    primogemResinRefillDay: "9999-12-31",
  },
  wishHistory: [],
  wishPity: Object.fromEntries(
    Object.values(BannerKind).map((bannerKind) => [
      bannerKind,
      {
        chartedWeaponId: MAX_SAVE_NUMBER,
        fatePoints: MAX_SAVE_NUMBER,
        fiveStarCount: MAX_SAVE_NUMBER,
        fourStarCount: MAX_SAVE_NUMBER,
        isFiveStarGuaranteed: false,
        isFourStarGuaranteed: false,
        lossCount: MAX_SAVE_NUMBER,
        wishCount: MAX_SAVE_NUMBER,
      },
    ]),
  ),
  worldLevelAdjustment: { changedAt: MAX_SAVE_INSTANT, isLowered: true },
}).length;
// The serialized save's ceiling, so a crafted document cannot grow the blob without limit: the skeleton, then each
// Collection at its cap times its longest entry. Each id is counted at its bound's length, since the game's ids are
// Plain characters, so an id that escapes to a longer serialization is refused by the same ceiling
export const MAX_GENSHIN_SAVE_LENGTH: number =
  SKELETON_GENSHIN_SAVE_LENGTH +
  MAX_ACHIEVEMENT_COUNT * getRecordEntryLength({ count: MAX_SAVE_NUMBER, finishedAt: MAX_SAVE_INSTANT }) +
  MAX_CHARACTER_COUNT * getListEntryLength(LONGEST_CHARACTER_SAVE) +
  MAX_CHARACTER_COUNT * getRecordEntryLength(MAX_SAVE_NUMBER) +
  COMMISSIONS_PER_DAY * getListEntryLength(MAX_SAVE_NUMBER) +
  COMMISSIONS_PER_DAY *
    getListEntryLength({ commissionId: MAX_SAVE_NUMBER, count: MAX_SAVE_NUMBER, dealtRank: MAX_SAVE_NUMBER }) +
  MAX_CRAFTING_RECIPE_COUNT * (getRecordEntryLength(MAX_SAVE_NUMBER) + getListEntryLength(MAX_SAVE_NUMBER)) +
  MAX_QUEST_COUNT *
    getRecordEntryLength({
      objectiveCounts: Array.from({ length: MAX_OBJECTIVE_COUNT }, () => MAX_SAVE_NUMBER),
      stepIndex: MAX_SAVE_NUMBER,
    }) +
  MAX_UNLOCKED_LANDMARK_COUNT * getListEntryLength(MAX_SAVE_ID) +
  MAX_OPENED_CHEST_COUNT * getListEntryLength(MAX_SAVE_ID) +
  MAX_SETTLED_SEELIE_COUNT * getListEntryLength(MAX_SAVE_ID) +
  MAX_SOLVED_PUZZLE_COUNT * getListEntryLength(MAX_SAVE_ID) +
  PARTY_TEAM_MAX_COUNT *
    getListEntryLength({
      characterIds: Array.from({ length: PARTY_TEAM_SIZE }, () => MAX_SAVE_NUMBER),
      name: "x".repeat(MAX_PARTY_TEAM_NAME_LENGTH),
    }) +
  MAX_CHARACTER_COUNT * getListEntryLength(MAX_SAVE_NUMBER) +
  MAX_FOUND_OCULUS_COUNT * getListEntryLength(MAX_SAVE_ID) +
  MAX_STATUE_REGION_COUNT * getRecordEntryLength({ heldCount: MAX_SAVE_NUMBER, level: MAX_SAVE_NUMBER }) +
  Object.keys(ArchiveSection).length * MAX_ARCHIVE_ENTRY_COUNT * getListEntryLength(MAX_SAVE_NUMBER) +
  MAX_ARCHIVE_KILL_COUNT * getRecordEntryLength(MAX_SAVE_NUMBER) +
  MAX_WISH_HISTORY_COUNT *
    getListEntryLength({ bannerKind: LONGEST_BANNER_KIND, itemId: MAX_SAVE_NUMBER, time: MAX_SAVE_INSTANT }) +
  MAX_INVENTORY_ITEM_COUNT *
    getListEntryLength({
      id: MAX_SAVE_NUMBER,
      itemId: MAX_SAVE_NUMBER,
      level: MAX_SAVE_NUMBER,
      quantity: MAX_ITEM_QUANTITY,
    });
// A new player's bag, which holds nothing until the world gives it something
export const EMPTY_INVENTORY_SAVE: InventorySave = { items: [], nextId: 0 };
// Mondstadt's Reputation at its first level, with no EXP toward the next
export const EMPTY_REPUTATION_SAVE: ReputationProgress = { exp: 0, level: 1 };
// A new player's party as the game starts one: the four default teams, the starting team deployed with its characters on
// The field, and nobody down
export const EMPTY_PARTY_SAVE: PartySave = {
  activeIndex: 0,
  deployedTeamIndex: 0,
  downCharacterIds: [],
  teams: Array.from({ length: DEFAULT_PARTY_TEAM_COUNT }, (_value, index) => ({
    characterIds: index === 0 ? [...STARTING_TEAM_CHARACTER_IDS] : [],
    name: "",
  })),
};
// A new player's save: the wallet as a new player's holds it, its Original Resin at the cap from the epoch, and nothing
// Else. The instants are ISO strings, as the save stores them
export const EMPTY_GENSHIN_SAVE: GenshinSave = {
  achievements: {},
  adventureExp: 0,
  archive: { kills: {}, progress: toArchiveProgressSave(new Map()) },
  characters: [],
  commissionDay: { claimedCommissionIds: [], dealtAt: "1970-01-01T00:00:00Z", dealtCommissions: [] },
  companionshipExp: {},
  crafting: { craftedCounts: {}, learnedRecipeIds: [] },
  inventory: EMPTY_INVENTORY_SAVE,
  offerings: { frostbearingTree: { heldCount: 0, level: 0 } },
  openedChests: [],
  party: EMPTY_PARTY_SAVE,
  puzzles: { settledSeelieIds: [], solvedPuzzleIds: [] },
  quests: {},
  reputation: EMPTY_REPUTATION_SAVE,
  statues: { foundOculusIds: [], regions: {} },
  travelerName: "",
  unlockedLandmarks: [],
  wallet: {
    currencies: { ...EMPTY_CURRENCIES },
    originalResinChangedAt: "1970-01-01T00:00:00Z",
    primogemResinRefillCount: 0,
    primogemResinRefillDay: "1970-01-01",
  },
  wishHistory: [],
  wishPity: InitialBannerKindWishPityMap,
  worldLevelAdjustment: { isLowered: false },
};
