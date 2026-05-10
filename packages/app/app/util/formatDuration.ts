import { dayjs } from "#shared/services/dayjs";

export const formatDuration = (ms: number): string => dayjs.duration(ms).humanize();
