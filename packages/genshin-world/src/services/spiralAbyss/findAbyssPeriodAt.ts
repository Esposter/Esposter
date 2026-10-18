import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { findLatestBegun } from "#src/services/shared/findLatestBegun";

// The period the Moon Spire offers at an instant: the one that began latest before it. A period has no recorded end, so a
// Dump read months on keeps its last period rather than none. Undefined before the first period begins
export const findAbyssPeriodAt = (periods: readonly AbyssPeriod[], now: Temporal.Instant): AbyssPeriod | undefined =>
  findLatestBegun(periods, ({ startsAt }) => startsAt, now);
