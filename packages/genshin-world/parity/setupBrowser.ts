import { NuxtImgStub } from "#parity/NuxtImgStub";
import { NuxtTimeStub } from "#parity/NuxtTimeStub";
import { recordConsoleWarnings } from "genshin-interface";
import { aroundEach, expect } from "vitest";
import { config } from "vitest-browser-vue";

config.global.stubs = { ...config.global.stubs, NuxtImg: NuxtImgStub, NuxtTime: NuxtTimeStub };

// A browser test whose body logs a Vue warning fails by name, as a visual case does for its fixture
aroundEach(async (runTest) => {
  const messages = await recordConsoleWarnings(runTest);
  // oxlint-disable-next-line vitest/no-standalone-expect -- aroundEach is a hook, and its expect fails the test it wraps
  expect(
    messages.filter((message) => message.startsWith("[Vue warn]")),
    "the console logged a Vue warning while the test ran",
  ).toStrictEqual([]);
});
