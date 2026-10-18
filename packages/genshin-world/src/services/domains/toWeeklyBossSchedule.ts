import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { WeeklyBossDomain } from "#src/models/domains/WeeklyBossDomain";

import { DomainKind } from "#src/models/domains/DomainKind";

// A weekly boss's trounce domain read as a challenge domain's schedule: its levels are open every day, and a level pays no
// Petrified Tree, since the boss's defeat leaves its weekly blossom instead. Its resin is paid at the blossom, so a level costs none here
export const toWeeklyBossSchedule = (domain: WeeklyBossDomain): DomainSchedule => ({
  kind: DomainKind.Trounce,
  levels: domain.levels.map((level) => ({
    ...level,
    resinCost: 0,
    scheduledDaysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    treeRewards: [],
  })),
});
