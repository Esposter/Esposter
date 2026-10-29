import { APPROVE_ENVIRONMENT_VARIABLE } from "#src/services/constants";
import { getVitestBrowserConfiguration, getVuePlugins, SOURCE_CONDITION } from "@esposter/configuration";
import { defaultClientConditions } from "vite";
import { defineConfig } from "vitest/config";

const browser = getVitestBrowserConfiguration({ height: 1080, width: 1920 });
// An update compares every pixel exactly, so the image it writes is the render: the default comparison passes a drift
// Below pixelmatch's threshold, and an update only rewrites a comparison that fails
if (process.env[APPROVE_ENVIRONMENT_VARIABLE] || process.argv.includes("-u") || process.argv.includes("--update"))
  browser.expect = { toMatchScreenshot: { ...browser.expect?.toMatchScreenshot, comparatorOptions: { threshold: 0 } } };
// The browser suite, apart from the default one so an ordinary run never starts a browser: every component drawn on a
// Game screen in the machine's own Edge at the game's 1080 pixels high, where a unit is a pixel, each image kept
// Beside its component as a test is
export default defineConfig({
  plugins: getVuePlugins(),
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  test: { browser, include: ["src/**/*.visual.ts"] },
});
