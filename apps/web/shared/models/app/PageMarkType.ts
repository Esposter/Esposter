// What kind of thing a page is, as the dock draws it
export const PageMarkType = { Resource: "Resource", Room: "Room" } as const;
export type PageMarkType = (typeof PageMarkType)[keyof typeof PageMarkType];
