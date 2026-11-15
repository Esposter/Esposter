// The editors that draw their screen in the editor shell, each with its own reader state. The value is the key the reader
// State is stored under, so it does not change
export const EditorType = {
  Dashboard: "dashboard",
  Email: "email",
  PageBuilder: "pageBuilder",
  Survey: "survey",
  Whiteboard: "whiteboard",
} as const;
export type EditorType = (typeof EditorType)[keyof typeof EditorType];
