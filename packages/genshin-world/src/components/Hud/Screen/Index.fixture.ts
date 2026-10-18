import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { SkillGlyphsLoaderMap } from "#src/generated/skillGlyphs/SkillGlyphsLoaderMap";
import { Element } from "#src/models/Element";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { readStatTables } from "#src/services/character/readStatTables";
import { readHudInterfaceRects } from "#src/services/hud/readHudInterfaceRects";
import { CHONGYUN_CHARACTER_ID } from "#src/services/kit/characters/chongyunKit";
import { VENTI_CHARACTER_ID } from "#src/services/kit/characters/ventiKit";
import { createParty } from "#src/services/party/createParty";
import { QUEST_MARK_MIN_HEIGHT } from "#src/services/quest/constants";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { createInput, STAMINA_MAX } from "genshin-engine";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The English mobile client's world HUD on a 1920 by 935 screen, from the public recording of a session at 70 seconds,
// Letterboxed, so cropped to the game's screen and scored over the part clear of its subtitles. Its touch layout is drawn,
// As the recording plays on a phone. Mona, Klee and the Traveler, named Tabibito by its player, are the party's rows it
// Shows, and Venti, a bow's wielder, is on the field at Lv. 90 with 17286 of 17400 HP. Its stamina stands full, so no
// Meter shows, and the quest tracked is the one the recording shows: its title, and its objective 1540m off and higher,
// At the least height the line names, its own height unread
const PARTY_CHARACTER_IDS = [10000041, 10000029, 10000007];
const FIELD_MEMBER_INDEX = 2;
const characterDataMap = new Map(
  [...(await readStatTables(GAME_DATA_LOCAL_BASE_URL)).characterDataMap].filter(([id]) =>
    PARTY_CHARACTER_IDS.includes(id),
  ),
);
const party = { ...createParty(PARTY_CHARACTER_IDS), activeIndex: FIELD_MEMBER_INDEX };
const ALBEDO_QUEST_ID = "albedo";
// Venti's icons for the field member here, and Chongyun's for `hud-world-keys`, whose frame has him on the field
const characterIdSkillGlyphsMap = new Map(
  await Promise.all(
    [VENTI_CHARACTER_ID, CHONGYUN_CHARACTER_ID].map(
      async (characterId) =>
        [characterId, await SkillGlyphsLoaderMap[characterId]?.(GAME_DATA_LOCAL_BASE_URL)] as const,
    ),
  ),
);

export const isBackdrop = true;
export const props = {
  // The reference's arrow points down, the character facing the camera, which looks north
  camera: { facing: Math.PI, x: 0, yaw: 0, z: 0 },
  catalogue: await readCatalogue(GAME_DATA_LOCAL_BASE_URL),
  characterDataMap,
  characterIdSkillGlyphsMap,
  frame: { gadgetCooldown: 0, pivotX: 0.5, pivotY: 0.5, seconds: 0, stamina: STAMINA_MAX },
  gameText: ENGLISH_GAME_TEXT,
  input: createInput(window),
  interfaceRects: await readHudInterfaceRects(GAME_DATA_LOCAL_BASE_URL),
  isTouch: true,
  landmarks: [],
  maxStamina: STAMINA_MAX,
  // Venti's figures as the frame shows them: his skill off cooldown, and his burst, which costs 60 Energy, filled to
  // 0.236 of its disc's height (21 of its 89 pixels)
  member: {
    burstCooldown: 0,
    burstCooldownSeconds: 0,
    characterId: VENTI_CHARACTER_ID,
    element: Element.Anemo,
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
  questMark: { distance: 1540, height: QUEST_MARK_MIN_HEIGHT },
  questProgress: { objectiveCounts: [], stepIndex: 0 },
  questTextMap: { albedo: "Look for Albedo", albedoStep: "" },
  trackedQuest: {
    descriptionTextId: "albedo",
    id: ALBEDO_QUEST_ID,
    kind: QuestKind.World,
    offerTalkIds: [],
    parentQuestIds: [],
    rewards: [],
    steps: [
      { id: "albedo", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "0" }], textId: "albedoStep" },
    ],
    talks: [],
    titleTextId: "albedo",
  },
  // The name the recording's player chose for the Traveler, which its third row shows
  travelerName: "Tabibito",
};
