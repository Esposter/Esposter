import type { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";

// The options an instance is created with and changed by setOptions, with PANZOOM_DEFAULT_OPTIONS as the defaults
export interface PanzoomOptions {
  animate?: boolean;
  canvas?: boolean;
  contain?: PanzoomContain;
  cursor?: string;
  disablePan?: boolean;
  disableXAxis?: boolean;
  disableYAxis?: boolean;
  disableZoom?: boolean;
  duration?: number;
  easing?: string;
  exclude?: Element[];
  excludeClass?: string;
  handleStartEvent?: (event: Event) => void;
  maxScale?: number;
  minScale?: number;
  noBind?: boolean;
  origin?: string;
  overflow?: string;
  panOnlyWhenZoomed?: boolean;
  pinchAndPan?: boolean;
  relative?: boolean;
  roundPixels?: boolean;
  setTransform?: (
    element: HTMLElement | SVGElement,
    detail: Pick<PanzoomEventDetail, "isSVG" | "scale" | "x" | "y">,
  ) => void;
  silent?: boolean;
  startScale?: number;
  startX?: number;
  startY?: number;
  step?: number;
  touchAction?: string;
}
