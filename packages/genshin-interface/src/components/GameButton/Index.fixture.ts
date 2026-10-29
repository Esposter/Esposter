import { GameButtonKind } from "#src/models/GameButtonKind";
import { InteractionState } from "#src/models/InteractionState";

// A side bar button the size of its lit disc, its icon a star, at rest, hovered, pressed and disabled
export const props = {
  kind: GameButtonKind.Disc,
  style: { fontSize: "calc(var(--unit) * 40)", height: "calc(var(--unit) * 65)", width: "calc(var(--unit) * 65)" },
  tip: "",
};
export const slot = "✦";
export const variants = {
  disabled: { disabled: true },
  hover: { interactionState: InteractionState.Hover },
  pressed: { interactionState: InteractionState.Pressed },
};
