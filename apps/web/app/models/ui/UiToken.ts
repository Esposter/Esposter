// The interface colours every theme defines, each written to the document as the `--ui-<token>` custom property
export enum UiToken {
  Accent = "accent",
  Background = "background",
  Border = "border",
  Error = "error",
  Info = "info",
  Muted = "muted",
  Panel = "panel",
  Success = "success",
  Text = "text",
  Warning = "warning",
}

export const UiTokens = Object.values(UiToken);
