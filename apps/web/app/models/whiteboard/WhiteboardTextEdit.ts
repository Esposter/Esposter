// A text being edited in place on a whiteboard: the element it belongs to, the draft typed so far, and the composition state an input method reports
// A commit that arrives during a composition is held until the composition ends, so the patch is written once and never mid-composition
export interface WhiteboardTextEdit {
  draft: string;
  elementId: string;
  isCommitPending: boolean;
  isComposing: boolean;
}
