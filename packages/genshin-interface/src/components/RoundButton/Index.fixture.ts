import { InterfaceIcon } from "#src/models/InterfaceIcon";

// Every glyph a round button wears
export const props = { icon: InterfaceIcon.Exit, label: InterfaceIcon.Exit };
export const variants = Object.fromEntries(
  Object.values(InterfaceIcon).map((icon) => [icon.toLowerCase(), { icon, label: icon }]),
);
