// A state a button is drawn in under the pointer: hovered, or pressed. Rest, selected and disabled are what it shows,
// And keyboard focus is drawn as a hover
export const InteractionState = { Hover: "Hover", Pressed: "Pressed" } as const;
export type InteractionState = (typeof InteractionState)[keyof typeof InteractionState];
