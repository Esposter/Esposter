// A mouse's button, spelt apart from every keyboard code so a binding names keys and mouse buttons alike
export const MouseButton = {
  // The wheel's press
  Auxiliary: "MouseAuxiliary",
  Primary: "MousePrimary",
  Secondary: "MouseSecondary",
} as const;
export type MouseButton = (typeof MouseButton)[keyof typeof MouseButton];
