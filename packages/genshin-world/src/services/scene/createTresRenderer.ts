import type { TresRendererSetupContext } from "@tresjs/core";

import { createGenshinRenderer } from "genshin-engine";
import { unref } from "vue";

// The renderer a canvas is handed, built on the canvas it set up. The context holds that canvas as a ref. Windows
// Chooses the discrete GPU by the system's own setting, so the browser's ask is read here rather than in the engine
export const createTresRenderer = (context: TresRendererSetupContext) =>
  createGenshinRenderer(unref(context.canvas), {
    honoursPowerPreference: !window.navigator.userAgent.includes("Windows"),
  });
