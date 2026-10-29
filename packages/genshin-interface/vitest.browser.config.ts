import {
  getVitestBrowserConfiguration,
  getVuePlugins,
  isVisualUpdate,
  SOURCE_CONDITION,
} from "@esposter/configuration";
import { defaultClientConditions } from "vite";
import { defineConfig } from "vitest/config";

const browser = getVitestBrowserConfiguration({ height: 1080, width: 1920 });
// The browser suite, apart from the default one so an ordinary run never starts a browser: every component drawn on a
// Game screen in the machine's own Edge at the game's 1080 pixels high, where a unit is a pixel, each image kept
// Beside its component as a test is
export default defineConfig({
  define: { IS_VISUAL_UPDATE: JSON.stringify(isVisualUpdate()) },
  plugins: getVuePlugins(),
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  test: { browser, include: ["src/**/*.visual.ts"] },
});
