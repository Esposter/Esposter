// The editors that draw their screen in the editor shell, each with its own reader state. The value is the key the reader
// State is stored under, so it does not change
export enum EditorType {
  PageBuilder = "pageBuilder",
  Survey = "survey",
  Whiteboard = "whiteboard",
}
