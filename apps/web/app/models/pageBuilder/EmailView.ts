// The view the email editor shows: the design canvas the owner edits, or Preview of the email as the server compiles it
export const EmailView = { Design: "design", Preview: "preview" } as const;
export type EmailView = (typeof EmailView)[keyof typeof EmailView];
