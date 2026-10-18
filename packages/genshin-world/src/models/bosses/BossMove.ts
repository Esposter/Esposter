import type { Element } from "#src/models/Element";

// One move a boss makes: its largest hit as a share of the boss's ATK, and how long its windup and its recovery last
export interface BossMove {
  // The share of the boss's ATK its largest hit deals
  atkPercent: number;
  // The element the hit deals, unset for a physical hit
  element?: Element;
  // How often a lingering move hits, where the wiki gives the interval
  hitIntervalSeconds?: number;
  // The move's name as the wiki gives it, most of them unofficial
  name: string;
  recoverySeconds: number;
  windupSeconds: number;
}
