export const LeyLineRefreshKind = {
  BlossomRefreshExp: "BLOSSOM_REFRESH_EXP",
  BlossomRefreshScoin: "BLOSSOM_REFRESH_SCOIN",
} as const;
export type LeyLineRefreshKind = (typeof LeyLineRefreshKind)[keyof typeof LeyLineRefreshKind];
