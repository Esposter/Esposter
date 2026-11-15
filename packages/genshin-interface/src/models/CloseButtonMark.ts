// The glyph a close button draws over its disc: the cross the game's screens share, or the back arrow.
// The back arrow belongs to the screens that go back to the Paimon menu
export const CloseButtonMark = { Back: "Back", Cross: "Cross" } as const;
export type CloseButtonMark = (typeof CloseButtonMark)[keyof typeof CloseButtonMark];
