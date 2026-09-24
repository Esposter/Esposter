// The interface colours every theme defines, each written to the document as the `--ui-<token>` custom property
export enum UiToken {
  Accent = "accent",
  Background = "background",
  Error = "error",
  Info = "info",
  Muted = "muted",
  Panel = "panel",
  PanelEdge = "panel-edge",
  Success = "success",
  Text = "text",
  Warning = "warning",
}

export const UiTokens = Object.values(UiToken);
