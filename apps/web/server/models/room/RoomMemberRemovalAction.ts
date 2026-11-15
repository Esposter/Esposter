// The past participle the system line reads, so the value is the word in the sentence
export const RoomMemberRemovalAction = { Banned: "banned", Kicked: "kicked" } as const;
export type RoomMemberRemovalAction = (typeof RoomMemberRemovalAction)[keyof typeof RoomMemberRemovalAction];
