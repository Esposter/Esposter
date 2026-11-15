// Where a level of a challenge domain stands for the player on a day: open to enter, refused for the Adventure Rank it
// Asks for, or closed on the day
export const DomainLevelState = { Closed: "Closed", Open: "Open", RankRequired: "RankRequired" } as const;
export type DomainLevelState = (typeof DomainLevelState)[keyof typeof DomainLevelState];
