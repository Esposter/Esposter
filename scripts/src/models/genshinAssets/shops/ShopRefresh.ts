// When a good's buy limit comes back, as the generated slice names it, mirroring the world's refresh kinds
export const ShopRefresh = { Daily: "Daily", Monthly: "Monthly", None: "None", Weekly: "Weekly" } as const;
export type ShopRefresh = (typeof ShopRefresh)[keyof typeof ShopRefresh];
