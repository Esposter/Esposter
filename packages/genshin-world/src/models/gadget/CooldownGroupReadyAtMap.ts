// The moment each cooldown group is ready again, keyed by the group. A group absent from it has never been used
export type CooldownGroupReadyAtMap = ReadonlyMap<number, Temporal.Instant>;
