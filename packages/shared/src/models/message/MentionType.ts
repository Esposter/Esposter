export const MentionType = { Role: "role", User: "user" } as const;
export type MentionType = (typeof MentionType)[keyof typeof MentionType];
