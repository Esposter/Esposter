import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { createFullHPCriticUpPassiveModule } from "#src/services/weapon/passives/createFullHPCriticUpPassiveModule";

// Each passive whose module is built, by the text id of its name, which a weapon's record holds, so a weapon's passive is
// Found by the name its table gives it. A passive with no module here gives its wielder nothing
export const WeaponPassiveNameTextIdCreateModuleMap: Readonly<
  Partial<Record<string, (params: number[]) => WeaponPassiveModule>>
> = {
  // Full HP Critic Up
  "2866125259": createFullHPCriticUpPassiveModule,
};
