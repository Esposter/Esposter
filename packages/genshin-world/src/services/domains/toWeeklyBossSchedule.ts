import type { DomainSchedule } from "#src/models/domains/DomainSchedule";
import type { WeeklyBossDomain } from "#src/models/domains/WeeklyBossDomain";

import { DomainKind } from "#src/models/domains/DomainKind";
import { ALL_DAYS_OF_WEEK } from "#src/services/domains/constants";

// A weekly boss's trounce domain read as a challenge domain's schedule: its levels are open every day, and a level pays no
// Petrified Tree, since the boss's defeat leaves its weekly blossom instead. Its resin is paid at the blossom, so a level costs none here,
// And it runs under no ley line disorder
export const toWeeklyBossSchedule = (domain: WeeklyBossDomain): DomainSchedule => ({
  artifactSetIds: [],
  kind: DomainKind.Trounce,
  levels: domain.levels.map((level) => ({
    ...level,
    disorder: "",
    resinCost: 0,
    scheduledDaysOfWeek: ALL_DAYS_OF_WEEK,
    treeArtifacts: [],
    treeRewards: [],
  })),
});
