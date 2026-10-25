import { SCHEDULE_LEAD_TIME_MS } from "@/services/message/constants";

// The soonest a message may be scheduled for, and therefore also what a picker opens on: a job the user
// Confirms without touching the picker still runs in the future.
export const getEarliestScheduledAt = () => new Date(Date.now() + SCHEDULE_LEAD_TIME_MS);
