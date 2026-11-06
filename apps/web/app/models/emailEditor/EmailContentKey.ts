// The content each panel of the email editor's layout shows. The editor's registry maps each key to the component that draws
// It, and the layout check reports a key the registry does not map, so the two cannot drift apart
export const EmailContentKey = {
  Bar: "bar",
  Content: "content",
  Layers: "layers",
  Palette: "palette",
  Prompt: "prompt",
  Style: "style",
} as const;
export type EmailContentKey = (typeof EmailContentKey)[keyof typeof EmailContentKey];
