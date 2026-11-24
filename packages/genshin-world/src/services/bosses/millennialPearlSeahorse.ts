import type { BossMove } from "#src/models/bosses/BossMove";

import { Element } from "#src/models/Element";
import { ENEMY_RECOVERY_SECONDS, ENEMY_WINDUP_SECONDS } from "#src/services/enemy/constants";

// The Millennial Pearl Seahorse's attacks from its wiki page, in the order the page lists them. Xenomare Pearl is the
// Pearl's shield and RES, not an attack, so it is not a move. Earthshock Descent to Tail Swipe are used only while the
// Pearl is intact, and Single Swipe to Charge only once it is destroyed, both phases not yet run. Each move's windup
// And recovery are the common enemies' and are PROVISIONAL until measured
export const MILLENNIAL_PEARL_SEAHORSE_MOVES: BossMove[] = [
  // Used only while the Xenomare Pearl is intact. The electrified ground it leaves deals 6% ATK as Electro DMG every
  // 0.5s, a Lingering effect not yet run
  {
    atkPercent: 95,
    element: Element.Electro,
    name: "Earthshock Descent",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Xenomare Pearl is intact. The electrified ground it leaves is a lingering effect not yet run
  {
    atkPercent: 50,
    element: Element.Electro,
    name: "Lock On",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Xenomare Pearl is intact. The electrified ground it leaves is a lingering effect not yet run
  {
    atkPercent: 80,
    element: Element.Electro,
    name: "Unihorn Thrust",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Xenomare Pearl is intact
  {
    atkPercent: 35,
    element: Element.Electro,
    name: "Swirling School of Fish",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Xenomare Pearl is intact
  {
    atkPercent: 60,
    element: Element.Electro,
    name: "Tail Swipe",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only while the Xenomare Pearl is intact, and once per fight. Its electrified ground is a lingering effect not
  // Yet run, and the Resonant Coral Orbs it summons are objects not yet run
  {
    atkPercent: 100,
    element: Element.Electro,
    name: "Fontemer Hoarthunder",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only once the Xenomare Pearl is destroyed
  {
    atkPercent: 50,
    name: "Single Swipe",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only once the Xenomare Pearl is destroyed
  {
    atkPercent: 50,
    name: "Double Swipe",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
  // Used only once the Xenomare Pearl is destroyed
  { atkPercent: 65, name: "Charge", recoverySeconds: ENEMY_RECOVERY_SECONDS, windupSeconds: ENEMY_WINDUP_SECONDS },
  // The pearl it recovers has 60% of its original durability, a shield figure not yet run
  {
    atkPercent: 90,
    element: Element.Electro,
    name: "Regeneration",
    recoverySeconds: ENEMY_RECOVERY_SECONDS,
    windupSeconds: ENEMY_WINDUP_SECONDS,
  },
];

// The Xenomare Pearl's shield durability in Gauge Units, whose break ends the pearl phase. Not yet run
export const MILLENNIAL_PEARL_SEAHORSE_PEARL_SHIELD_GAUGE_UNITS = 19;
// The pearl's durability in Gauge Units below which Fontemer Hoarthunder is used, from its entry. Not yet run
export const MILLENNIAL_PEARL_SEAHORSE_HOARTHUNDER_GAUGE_UNITS = 7;
// The same threshold once the pearl has been destroyed once, from its entry. Not yet run
export const MILLENNIAL_PEARL_SEAHORSE_HOARTHUNDER_AFTER_DESTROY_GAUGE_UNITS = 4.2;
