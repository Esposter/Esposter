// When a good's buy limit comes back: at the game's daily hour, on the first of the month at that hour, on the Monday
// At That hour, or never
export const ShopRefresh = { Daily: "Daily", Monthly: "Monthly", None: "None", Weekly: "Weekly" } as const;
export type ShopRefresh = (typeof ShopRefresh)[keyof typeof ShopRefresh];
