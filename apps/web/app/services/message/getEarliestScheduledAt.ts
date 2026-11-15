import { SCHEDULE_LEAD_TIME_MS } from "#src/services/message/constants";

export const getEarliestScheduledAt = () => new Date(Date.now() + SCHEDULE_LEAD_TIME_MS);
