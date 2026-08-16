import { dayjs } from "#shared/services/dayjs";

export const AUDIO_RECORDER_TIMER_INTERVAL = dayjs.duration(1, "second").asMilliseconds();
