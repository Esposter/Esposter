export const ContentTypePhaserMethod = { Audio: "audio", Font: "font", Image: "image" } as const;
export type ContentTypePhaserMethod = (typeof ContentTypePhaserMethod)[keyof typeof ContentTypePhaserMethod];
