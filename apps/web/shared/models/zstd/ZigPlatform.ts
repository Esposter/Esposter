export const ZigPlatform = { Darwin: "darwin", Linux: "linux", Win32: "win32" } as const;
export type ZigPlatform = (typeof ZigPlatform)[keyof typeof ZigPlatform];
