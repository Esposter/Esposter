// The largest unit a mail's time left is shown in, or the mail is under a minute from expiring
export const MailExpiryUnit = { Day: "day", Hour: "hour", LessThanMinute: "lessThanMinute", Minute: "minute" } as const;
export type MailExpiryUnit = (typeof MailExpiryUnit)[keyof typeof MailExpiryUnit];
