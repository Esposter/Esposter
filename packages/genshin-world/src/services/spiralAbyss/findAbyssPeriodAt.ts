import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { findLatestBegun } from "#src/services/shared/findLatestBegun";

// The period the Moon Spire offers at an instant, the one findLatestBegun finds among its periods
export const findAbyssPeriodAt = (periods: readonly AbyssPeriod[], now: Temporal.Instant): AbyssPeriod | undefined =>
  findLatestBegun(periods, ({ startsAt }) => startsAt, now);
