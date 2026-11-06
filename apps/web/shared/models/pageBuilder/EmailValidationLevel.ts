// The levels MJML validates an email at that report a message. Strict refuses the email on any message, and soft renders it
// with the messages in its result. Skip validates nothing, so it reports none and is not named here
export const EmailValidationLevel = { Soft: "soft", Strict: "strict" } as const;
export type EmailValidationLevel = (typeof EmailValidationLevel)[keyof typeof EmailValidationLevel];
