// The most expeditions that may be out at once before any Adventure Rank raises it
export const EXPEDITION_BASE_LIMIT = 2;
// The Adventure Rank expeditions are sent from, at Katheryne's branch of the Adventurers' Guild
export const EXPEDITION_UNLOCK_RANK = 14;
// Katheryne's NPC id, whose talk opens the expedition screen. Provisional: the Adventurers' Guild row the NPC table holds
// For her, the lowest id of the Katheryne rows, placed at the Adventurers' building point
export const KATHERYNE_NPC_ID = "1512";
// Mondstadt's expedition pins at 1080 high in the frame, in the order of the places the table holds, measured off the
// Public clip of the expedition screen at 26 seconds
export const MONDSTADT_EXPEDITION_PIN_LAYOUT: readonly { x: number; y: number }[] = [
  { x: 815, y: 195 },
  { x: 565, y: 410 },
  { x: 1053, y: 338 },
  { x: 1118, y: 455 },
  { x: 745, y: 530 },
  { x: 1175, y: 660 },
];
