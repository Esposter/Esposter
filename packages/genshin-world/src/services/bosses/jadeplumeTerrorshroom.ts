import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Jadeplume Terrorshroom's attacks from its wiki page, in the order the page lists them. Majestic Dance, Barrage
// And Volatile Spore Cloud are its normal attacks, Feather Spreading, Furious Charge and Rapid Pecks follow a full Fury
// Bar, and Proliferating Spores follows Burning landing on it while it is not activated, the Scorched state. The Fury
// Bar and those States are not run yet. Radical Vitality deals no share of ATK, so it is left out. Each move's windup
// And recovery are the Common enemies' and PROVISIONAL until measured, the wiki giving no timings
export const JADEPLUME_TERRORSHROOM_MOVES: BossMove[] = [
  {
    atkPercent: 100,
    element: Element.Dendro,
    name: "Majestic Dance",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 30,
    element: Element.Dendro,
    name: "Barrage",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Dendro,
    name: "Volatile Spore Cloud",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 45,
    element: Element.Dendro,
    name: "Feather Spreading",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 120,
    element: Element.Dendro,
    name: "Furious Charge",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 120,
    element: Element.Dendro,
    name: "Rapid Pecks",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  {
    atkPercent: 50,
    element: Element.Dendro,
    name: "Proliferating Spores",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The seconds the Jadeplume Terrorshroom is paralysed for after an activated attack, about 15 by the wiki, not yet run
export const JADEPLUME_TERRORSHROOM_PARALYSIS_SECONDS = 15;
