export const ScheduledMessageJobType = { Reminder: "Reminder", ScheduledMessage: "ScheduledMessage" } as const;
export type ScheduledMessageJobType = (typeof ScheduledMessageJobType)[keyof typeof ScheduledMessageJobType];
