export const IndexedDbStoreName = { Members: "Members", Messages: "Messages", Rooms: "Rooms" } as const;
export type IndexedDbStoreName = (typeof IndexedDbStoreName)[keyof typeof IndexedDbStoreName];
