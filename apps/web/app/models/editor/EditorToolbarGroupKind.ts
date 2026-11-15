// Tools are chosen one at a time, as a radio group that is one tab stop; commands are run, each a button of its own
export const EditorToolbarGroupKind = { Command: "Command", Tool: "Tool" } as const;
export type EditorToolbarGroupKind = (typeof EditorToolbarGroupKind)[keyof typeof EditorToolbarGroupKind];
