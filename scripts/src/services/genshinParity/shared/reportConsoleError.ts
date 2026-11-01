import type { ConsoleMessage } from "playwright";

import { getResultAsync, noop } from "@esposter/shared";

// A console error printed with its first argument's message, and the URL of a resource that failed to load, since the
// Page's text names only the error's class: a ZodError's issues are its message
export const reportConsoleError = (message: ConsoleMessage): Promise<void> =>
  getResultAsync(async () => {
    const [firstArgument] = message.args();
    const detail = firstArgument
      ? await firstArgument.evaluate((value) => (value instanceof Error ? value.message : String(value)))
      : message.text();
    console.error(`parity page: ${detail} ${message.location().url}`);
  }).match(noop, console.error);
