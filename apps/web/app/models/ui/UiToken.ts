// The interface colours every theme defines, each written to the document as the `--ui-<token>` custom property
export enum UiToken {
  Accent = "accent",
  Background = "background",
  Border = "border",
  Divider = "divider",
  Error = "error",
  Info = "info",
  Lifted = "lifted",
  Muted = "muted",
  Panel = "panel",
  Success = "success",
  Text = "text",
  Warning = "warning",
}

export const UiTokens = Object.values(UiToken);
