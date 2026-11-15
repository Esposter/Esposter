export const VideoSite = { Bilibili: "bilibili", Youtube: "youtube" } as const;
export type VideoSite = (typeof VideoSite)[keyof typeof VideoSite];
