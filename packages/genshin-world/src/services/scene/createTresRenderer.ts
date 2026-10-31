import type { TresRendererSetupContext } from "@tresjs/core";

import { createGenshinRenderer } from "genshin-engine";
import { unref } from "vue";

// The renderer a canvas is handed, built on the canvas it set up. The context holds that canvas as a ref
export const createTresRenderer = (context: TresRendererSetupContext) => createGenshinRenderer(unref(context.canvas));
