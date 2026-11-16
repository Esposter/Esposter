import type { Browser, BrowserContextOptions } from "playwright";

import { HYDRATED_BINDING, HYDRATION_MESSAGE_REGEX, HYDRATION_TIMEOUT_MS } from "#scripts/hydration/constants";
import { observeHydration } from "#scripts/hydration/observeHydration";
import { setTimeout } from "node:timers/promises";

// One page in a context of its own, so pages run side by side: each awaits its own hydration event, never a timing
export const checkPage = async (browser: Browser, device: BrowserContextOptions, location: string) => {
  const context = await browser.newContext(device);
  const page = await context.newPage();
  const messages: string[] = [];
  page.on("console", (message) => {
    if (HYDRATION_MESSAGE_REGEX.test(message.text())) messages.push(message.text());
  });
  const { promise, resolve } = Promise.withResolvers<boolean>();
  await page.exposeFunction(HYDRATED_BINDING, () => {
    resolve(true);
  });
  await page.addInitScript(observeHydration, HYDRATED_BINDING);
  const timeout = new AbortController();
  await page.goto(location);
  const isHydrated = await Promise.race([promise, setTimeout(HYDRATION_TIMEOUT_MS, false, { signal: timeout.signal })]);
  timeout.abort();
  await context.close();
  const name = `${location} at ${device.viewport?.width}x${device.viewport?.height}`;
  console.info(`${name}: ${isHydrated && messages.length === 0 ? "clean" : "mismatched"}`);
  return [
    ...(isHydrated ? [] : [`${name}: never finished hydrating`]),
    ...messages.map((message) => `${name}: ${message}`),
  ];
};
