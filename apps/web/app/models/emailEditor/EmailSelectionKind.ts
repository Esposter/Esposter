// The selection kinds the email editor's layout tells apart: nothing selected, which is the empty kind the layout's context
// Carries, or a node, whichever block type it is, so the inspector's tabs do not depend on the type
export const EmailSelectionKind = { Node: "node", None: "" } as const;
export type EmailSelectionKind = (typeof EmailSelectionKind)[keyof typeof EmailSelectionKind];
