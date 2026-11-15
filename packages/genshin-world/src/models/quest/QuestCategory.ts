// The lists the game's quest screen files every quest under, each its own tab: an event's quests are listed among
// The world quests, as its data's own quest types have it
export const QuestCategory = { Archon: "Archon", Commission: "Commission", Story: "Story", World: "World" } as const;
export type QuestCategory = (typeof QuestCategory)[keyof typeof QuestCategory];
