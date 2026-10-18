import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { readExpeditionLimitAdds } from "#src/services/expedition/readExpeditionLimitAdds";
import { readMondstadtExpeditionPlaces } from "#src/services/expedition/readMondstadtExpeditionPlaces";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { createSeededRandom } from "genshin-engine";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Mondstadt's expedition map as the public clip shows it at 26 seconds: six places pinned, Wolvendom picked, and Kaeya
// Out on one expedition. The six places are the table's first six, and their pins sit at their positions in the frame
// At 1080 high, so each place's rank, quest and statue are read as the open ones the map shows
const places = await readMondstadtExpeditionPlaces(GAME_DATA_LOCAL_BASE_URL);
const pinnedPlaces = places.slice(0, 6);
const pinLayout = [
  { x: 815, y: 195 },
  { x: 565, y: 410 },
  { x: 1053, y: 338 },
  { x: 1118, y: 455 },
  { x: 745, y: 530 },
  { x: 1175, y: 660 },
];
const now = Temporal.Instant.fromEpochMilliseconds(0);

export const props = {
  adventureRank: Math.max(...pinnedPlaces.map(({ rankLevel }) => rankLevel)),
  characters: [
    { id: 1, name: "Amber" },
    { id: 2, name: "Lisa" },
    { id: 3, name: "Kaeya" },
    { id: 4, name: "Xingqiu" },
    { id: 5, name: "Noelle" },
    { id: 6, name: "Sucrose" },
    { id: 7, name: "Barbara" },
  ],
  completedQuestIds: new Set(pinnedPlaces.map(({ questId }) => questId)),
  downCharacterIds: new Set<number>(),
  expeditionLimitAdds: await readExpeditionLimitAdds(GAME_DATA_LOCAL_BASE_URL),
  // Kaeya is out to a place the Mondstadt map does not pin, an hour into a twelve-hour expedition
  expeditions: [{ characterId: 3, hours: 12, leftAt: now.subtract({ hours: 1 }), placeId: 0 }],
  gameText: ENGLISH_GAME_TEXT,
  hours: 4,
  inventory: { items: [], nextId: 1 },
  materialDataMap: await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL),
  nameText: englishNameText,
  now,
  picking: false,
  pinPositions: new Map(pinnedPlaces.map(({ id }, index) => [id, pinLayout[index] ?? { x: 0, y: 0 }] as const)),
  // Wolvendom is the fifth pinned place, the one the clip has picked
  place: pinnedPlaces.at(4)?.id,
  places,
  random: createSeededRandom(WORLD_RANDOM_SEED),
  statueRegions: { mondstadt: { heldCount: 0, level: 1 } },
  wallet: { ...EMPTY_WALLET },
};
