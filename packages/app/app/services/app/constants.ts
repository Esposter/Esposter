import { dayjs } from "#shared/services/dayjs";

// How long a pending "G" chord prefix stays armed before the second key must be pressed
export const KEY_CHORD_TIMEOUT_MS = dayjs.duration(1, "second").asMilliseconds();
