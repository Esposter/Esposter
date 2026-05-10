export enum ObjectgroupName {
  Chest = "Chest",
  Door = "Door",
  "Npc/John" = "Npc/John",
  "Npc/Mum" = "Npc/Mum",
  "Npc/Smith" = "Npc/Smith",
  Sign = "Sign",
}

export const ObjectgroupNames: ReadonlySet<ObjectgroupName> = new Set(Object.values(ObjectgroupName));
