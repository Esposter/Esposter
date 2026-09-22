// The idle threshold is stored in milliseconds and edited in minutes
export const MS_PER_MINUTE: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
