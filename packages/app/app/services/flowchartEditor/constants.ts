import type { ViewportTransform } from "@vue-flow/core";

export const FLOWCHART_EDITOR_LOCAL_STORAGE_KEY = "flowchart-editor-store";

export const DEFAULT_VIEWPORT_TRANSFORM = { x: 0, y: 0, zoom: 1 } as const satisfies ViewportTransform;
