// A mode arrives as the SDK's own string and is kept only when the contract knows it
export interface SessionSettingsUpdate {
  model?: string;
  permissionMode?: string;
}
