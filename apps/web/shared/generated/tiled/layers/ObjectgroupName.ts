export const ObjectgroupName = {
  Chest: "Chest",
  Door: "Door",
  "Npc/John": "Npc/John",
  "Npc/Mum": "Npc/Mum",
  "Npc/Smith": "Npc/Smith",
  Sign: "Sign",
} as const;
export type ObjectgroupName = (typeof ObjectgroupName)[keyof typeof ObjectgroupName];
