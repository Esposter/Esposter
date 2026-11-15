// The settings a toggle row flips between On and Off, by their names in GenshinSettings: the camera's slope pitch
export const ToggleSetting = { SlopePitch: "slopePitch" } as const;
export type ToggleSetting = (typeof ToggleSetting)[keyof typeof ToggleSetting];
