import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

import { PANZOOM_DEFAULT_DURATION, PANZOOM_DEFAULT_EASING } from "#src/services/panzoom/constants";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { writePanzoomStyle } from "#src/services/panzoom/writePanzoomStyle";

// Makes the state the current one and writes it: the transition first, timed when the call animates and none otherwise,
// Then the transform, which setTransform writes instead when the options give one, and the scale's custom property.
// A destroyed panzoom keeps its state and writes nothing
export const writePanzoomState = (
  context: PanzoomContext,
  state: PanzoomState,
  { animate, duration = PANZOOM_DEFAULT_DURATION, easing = PANZOOM_DEFAULT_EASING, setTransform }: PanzoomPanOptions,
): void => {
  if (context.isDestroyed) return;

  const { element } = context;
  context.state = state;
  writePanzoomStyle(context, element, "transition", animate ? `transform ${duration}ms ${easing}` : "none");
  if (setTransform) setTransform(element, getPanzoomEventDetail(context));
  else writePanzoomStyle(context, element, "transform", `scale(${state.scale}) translate(${state.x}px, ${state.y}px)`);

  writePanzoomStyle(context, element, "--panzoom-scale", `${state.scale}`);
};
