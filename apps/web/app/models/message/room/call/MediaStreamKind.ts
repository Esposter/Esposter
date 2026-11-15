export const MediaStreamKind = { Audio: "audio", Video: "video" } as const;
export type MediaStreamKind = (typeof MediaStreamKind)[keyof typeof MediaStreamKind];
