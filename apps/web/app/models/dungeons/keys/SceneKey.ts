export const SceneKey = {
  Battle: "Battle",
  Inventory: "Inventory",
  MobileJoystick: "MobileJoystick",
  MonsterDetails: "MonsterDetails",
  MonsterParty: "MonsterParty",
  Preloader: "Preloader",
  Settings: "Settings",
  Title: "Title",
  World: "World",
} as const;
export type SceneKey = (typeof SceneKey)[keyof typeof SceneKey];
