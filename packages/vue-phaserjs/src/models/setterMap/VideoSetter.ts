export const VideoSetter = { Key: "key", Muted: "muted", Volume: "volume" } as const;
export type VideoSetter = (typeof VideoSetter)[keyof typeof VideoSetter];
