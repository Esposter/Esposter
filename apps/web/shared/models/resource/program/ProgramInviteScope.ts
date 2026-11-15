// Every participant for the first invitation, or only those still awaiting a response for the reminder
export const ProgramInviteScope = { All: "All", Awaiting: "Awaiting" } as const;
export type ProgramInviteScope = (typeof ProgramInviteScope)[keyof typeof ProgramInviteScope];
