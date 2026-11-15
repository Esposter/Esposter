// What a key does to a text edit in place: commit the draft to its element, or discard the draft
export const WhiteboardTextEditAction = { Commit: "commit", Discard: "discard" } as const;
export type WhiteboardTextEditAction = (typeof WhiteboardTextEditAction)[keyof typeof WhiteboardTextEditAction];
