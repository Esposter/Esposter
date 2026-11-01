import type { Panzoom } from "#src/models/panzoom/Panzoom";
import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { PanzoomZoomDirection } from "#src/models/panzoom/PanzoomZoomDirection";
import { Operation } from "#src/models/shared/Operation";
import { PANZOOM_DEFAULT_OPTIONS, PANZOOM_DEFAULT_TRANSFORM_ORIGIN } from "#src/services/panzoom/constants";
import { applyPanzoomStyles } from "#src/services/panzoom/applyPanzoomStyles";
import { bindPanzoom } from "#src/services/panzoom/bindPanzoom";
import { fitPanzoom } from "#src/services/panzoom/fitPanzoom";
import { getPanzoomMeasure } from "#src/services/panzoom/getPanzoomMeasure";
import { getPanzoomParent } from "#src/services/panzoom/getPanzoomParent";
import { getPanzoomStartState } from "#src/services/panzoom/getPanzoomStartState";
import { getPanzoomStepScale } from "#src/services/panzoom/getPanzoomStepScale";
import { getPanzoomWheelScale } from "#src/services/panzoom/getPanzoomWheelScale";
import { panPanzoom } from "#src/services/panzoom/panPanzoom";
import { resetPanzoom } from "#src/services/panzoom/resetPanzoom";
import { restorePanzoomStyles } from "#src/services/panzoom/restorePanzoomStyles";
import { writePanzoomState } from "#src/services/panzoom/writePanzoomState";
import { writePanzoomStyle } from "#src/services/panzoom/writePanzoomStyle";
import { zoomPanzoom } from "#src/services/panzoom/zoomPanzoom";

// One panzoom on an element: it moves the element by writing its transform, and reads the element and its parent to contain it.
// Construction applies the start state synchronously and sends no event, so a pan made on the next line is not overwritten
export const createPanzoom = (element: PanzoomElement, options: PanzoomOptions = {}): Panzoom => {
  if (element.nodeType !== Node.ELEMENT_NODE)
    throw new InvalidOperationError(Operation.Create, createPanzoom.name, "the element is not an Element");
  if (!element.isConnected)
    throw new InvalidOperationError(Operation.Create, createPanzoom.name, "the element is not attached to a document");

  const parent = getPanzoomParent(element);
  if (!parent)
    throw new InvalidOperationError(Operation.Create, createPanzoom.name, "the element has no parent to contain it");

  const context: PanzoomContext = {
    element,
    isClickSuppressed: false,
    isDestroyed: false,
    options: { ...PANZOOM_DEFAULT_OPTIONS, ...options },
    parent,
    pointers: new Map(),
    state: { scale: 1, x: 0, y: 0 },
    styles: new Map(),
  };
  // The identity transform is written first, so the start state is taken from a measure of the element as it is laid out
  writePanzoomState(context, context.state, { animate: false });
  const start = getPanzoomStartState(context.state, getPanzoomMeasure(element, parent, context.state), context.options);
  writePanzoomState(context, start, { animate: false });
  writePanzoomStyle(context, element, "transform-origin", options.origin ?? PANZOOM_DEFAULT_TRANSFORM_ORIGIN);
  applyPanzoomStyles(context);

  let controller: AbortController | undefined;
  const bind = (): void => {
    if (controller || context.isDestroyed) return;

    controller = new AbortController();
    bindPanzoom(context, controller.signal);
  };
  const destroy = (): void => {
    context.isDestroyed = true;
    controller?.abort();
    controller = undefined;
    context.drag = undefined;
    context.pinch = undefined;
    context.pointers.clear();
    restorePanzoomStyles(context);
  };

  const panzoom: Panzoom = {
    bind,
    destroy,
    fit: (fitOptions = {}) => fitPanzoom(context, fitOptions),
    getOptions: () => ({ ...context.options }),
    getPan: () => ({ x: context.state.x, y: context.state.y }),
    getScale: () => context.state.scale,
    pan: (x, y, panOptions = {}) => panPanzoom(context, { x, y }, panOptions),
    reset: (resetOptions = {}) => resetPanzoom(context, resetOptions),
    resetStyle: () => {
      restorePanzoomStyles(context, ["cursor", "overflow", "touch-action", "transform-origin", "user-select"]);
    },
    setOptions: (newOptions = {}) => {
      context.options = { ...context.options, ...newOptions };
      applyPanzoomStyles(context);
    },
    zoom: (scale, zoomOptions = {}) => zoomPanzoom(context, scale, zoomOptions),
    zoomIn: (zoomOptions = {}) =>
      zoomPanzoom(context, getPanzoomStepScale(context.state.scale, PanzoomZoomDirection.In, context.options.step), {
        animate: true,
        ...zoomOptions,
      }),
    zoomOut: (zoomOptions = {}) =>
      zoomPanzoom(context, getPanzoomStepScale(context.state.scale, PanzoomZoomDirection.Out, context.options.step), {
        animate: true,
        ...zoomOptions,
      }),
    zoomToPoint: (scale, point, zoomOptions, originalEvent) =>
      zoomPanzoom(context, scale, { ...zoomOptions, focal: { x: point.clientX, y: point.clientY } }, originalEvent),
    zoomWithWheel: (event, zoomOptions = {}) => {
      event.preventDefault();
      return zoomPanzoom(
        context,
        getPanzoomWheelScale(context.state.scale, event, context.options.step),
        { ...zoomOptions, animate: false, focal: { x: event.clientX, y: event.clientY } },
        event,
      );
    },
  };
  if (!context.options.noBind) bind();

  return panzoom;
};
