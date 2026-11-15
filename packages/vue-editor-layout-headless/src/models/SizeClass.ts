// The window's size class, which the caller derives from the display the app already reads, so the package never measures a width
export const SizeClass = { Compact: "compact", Expanded: "expanded", Medium: "medium" } as const;
export type SizeClass = (typeof SizeClass)[keyof typeof SizeClass];
