import type { PublishEvent } from "@esposter/db-schema";

import { describe } from "vitest";

// Nothing subscribes to the server object in a test, so a published event lands nowhere
export const publishToServer = (_event: PublishEvent): Promise<void> => Promise.resolve();

describe.todo("publishToServer");
