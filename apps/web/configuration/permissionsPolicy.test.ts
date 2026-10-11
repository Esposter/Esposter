import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { security } from "./security.ts";

// The security module denies every powerful feature unless the app opens it, so a call the policy denies fails only
// In the browser, and only on the screen that makes it: the Genshin world's `getGamepads` threw a SecurityError
// Once the module's stricter defaults replaced nuxt-security's. Each feature is read off the API that needs it, in
// Every source tree the app bundles
describe("permissionsPolicy", () => {
  const FeatureCallRegexMap: Record<string, RegExp> = {
    autoplay: /\.play\(\)/u,
    "clipboard-read": /clipboard\.read/u,
    "clipboard-write": /clipboard\.write|useClipboard\(/u,
    "display-capture": /getDisplayMedia/u,
    fullscreen: /requestFullscreen|useFullscreen\(/u,
    gamepad: /getGamepads/u,
    geolocation: /navigator\.geolocation/u,
    "picture-in-picture": /requestPictureInPicture/u,
    "publickey-credentials-get": /navigator\.credentials\.get/u,
    "screen-wake-lock": /wakeLock\.request|useWakeLock\(/u,
  };
  const SOURCE_DIRECTORIES = [
    join(import.meta.dirname, "../app"),
    join(import.meta.dirname, "../../../packages/genshin-engine/src"),
    join(import.meta.dirname, "../../../packages/genshin-interface/src"),
    join(import.meta.dirname, "../../../packages/genshin-world/src"),
    join(import.meta.dirname, "../../../packages/vue-phaserjs/src"),
  ];
  const SOURCE_FILE_REGEX = /(?<!\.test)\.(?:ts|vue)$/u;
  const sources = SOURCE_DIRECTORIES.flatMap((directory) =>
    readdirSync(directory, { encoding: "utf8", recursive: true })
      .filter((path) => SOURCE_FILE_REGEX.test(path))
      .map((path) => readFileSync(join(directory, path), "utf8")),
  );

  test.each(Object.entries(FeatureCallRegexMap))("opens %s wherever the app calls it", (feature, callRegex) => {
    expect.hasAssertions();

    const isCalled = sources.some((source) => callRegex.test(source));
    const permissionsPolicy = security?.headers ? security.headers.permissionsPolicy || undefined : undefined;
    // A feature's value is its origin list, or `false` to deny it outright
    const origins = permissionsPolicy?.[feature];

    expect(!isCalled || (Array.isArray(origins) && origins.includes("self"))).toBe(true);
  });
});
