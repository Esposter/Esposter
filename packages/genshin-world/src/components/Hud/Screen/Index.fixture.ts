import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readStatTables } from "#src/services/character/readStatTables";
import { readHudInterfaceRects } from "#src/services/hud/readHudInterfaceRects";
import { createParty } from "#src/services/party/createParty";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { createInput, STAMINA_MAX } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

const englishNameText = await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);

// The English mobile client's world HUD on a 1920 by 935 screen, from the public recording of a session at 70 seconds,
// Letterboxed, so cropped to the game's screen and scored over the part clear of its subtitles. Its touch layout is drawn,
// As the recording plays on a phone. Mona, Klee and the Traveler are the party's rows it shows, and Venti, a bow's
// Wielder, is on the field at Lv. 90 with 17286 of 17400 HP. Its stamina stands full, so no meter shows, and the quest
// Tracked is the one the recording shows: its title, with its altitude line not built yet
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
  catalogue: await readCatalogue(GAME_DATA_LOCAL_BASE_URL),
  characterDataMap,
  frame: { pivotX: 0.5, pivotY: 0.5, seconds: 0, stamina: STAMINA_MAX },
  gameText: ENGLISH_GAME_TEXT,
  input: createInput(window),
  interfaceRects: await readHudInterfaceRects(GAME_DATA_LOCAL_BASE_URL),
  isTouch: true,
  landmarks: [],
  // Venti's figures as the frame shows them: his skill off cooldown, and his burst, which costs 60 Energy, filled to
  // 0.236 of its disc's height (21 of its 89 pixels)
  member: {
    burstCooldown: 0,
    burstCooldownSeconds: 0,
    energy: 14.2,
    energyCost: 60,
    health: 17286,
    level: 90,
    maxHealth: 17400,
    skillCooldown: 0,
    skillCooldownSeconds: 0,
    weaponType: WeaponType.Bow,
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
