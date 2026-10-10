import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readStatTables } from "#src/services/character/readStatTables";
import { createParty } from "#src/services/party/createParty";
import { createInput, STAMINA_MAX } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

const englishNameText = await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);

// The English PC client's world HUD at 1080 high, from the public recording of a session at 70 seconds, letterboxed,
// So cropped to the game's screen and scored over the part clear of its subtitles. Mona, Klee and the Traveler are
// The deployed team, the Traveler on the field at Lv. 90 with 17286 of 17400 HP. Its stamina stands full, so no meter
// Shows, and the quest tracked is the one the recording shows: its title, with its altitude line not built yet
const PARTY_CHARACTER_IDS = [10000041, 10000029, 10000007];
const FIELD_MEMBER_INDEX = 2;
const characterDataMap = new Map(
  [...(await readStatTables(GAME_DATA_LOCAL_BASE_URL)).characterDataMap].filter(([id]) =>
    PARTY_CHARACTER_IDS.includes(id),
  ),
);
const party = { ...createParty(PARTY_CHARACTER_IDS), activeIndex: FIELD_MEMBER_INDEX };
const ALBEDO_QUEST_ID = "albedo";

export const isBackdrop = true;
export const props = {
  camera: { x: 0, yaw: 0, z: 0 },
  characterDataMap,
  frame: { pivotX: 0.5, pivotY: 0.5, seconds: 0, stamina: STAMINA_MAX },
  gameText: ENGLISH_GAME_TEXT,
  input: createInput(window),
  landmarks: [],
  // Provisional: the burst unfilled and the skill off cooldown, read as the recording shows them until the
  // Energy and cooldown the frame holds are measured off a recording of the Traveler's buttons
  member: {
    burstCooldown: 0,
    burstCooldownSeconds: 0,
    energy: 0,
    energyCost: 40,
    health: 17286,
    level: 90,
    maxHealth: 17400,
    skillCooldown: 0,
    skillCooldownSeconds: 0,
  },
  nameTextMap: englishNameText,
  party,
  questProgress: { objectiveCounts: [], stepIndex: 0 },
  questTextMap: { albedo: "Look for Albedo", albedoStep: "" },
  trackedQuest: {
    descriptionTextId: "albedo",
    id: ALBEDO_QUEST_ID,
    kind: QuestKind.World,
    steps: [
      { id: "albedo", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "0" }], textId: "albedoStep" },
    ],
    talks: [],
    titleTextId: "albedo",
  },
};
