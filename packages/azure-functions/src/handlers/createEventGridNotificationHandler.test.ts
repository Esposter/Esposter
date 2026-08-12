import type { InvocationContext as AInvocationContext, EventGridEvent } from "@azure/functions";

import { createEventGridNotificationHandler } from "@/handlers/createEventGridNotificationHandler";
import { InvocationContext } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

// The three notification handlers are this factory applied to a schema and a send, so what is worth pinning is
// The factory: that send receives what the schema parsed, and that a failing send reaches Event Grid as a
// Rejection rather than a swallowed log — a redelivery is the only thing that retries the notification
describe(createEventGridNotificationHandler, () => {
  const context = new InvocationContext();
  const schema = z.object({ id: z.string() });
  const data: z.infer<typeof schema> = { id: "" };
  const createEvent = (): EventGridEvent => ({
    data,
    dataVersion: "1.0",
    eventTime: "1970-01-01T00:00:00.000Z",
    eventType: "",
    id: crypto.randomUUID(),
    metadataVersion: "1",
    subject: "",
    topic: "",
  });

  test("hands the parsed data to send", async () => {
    expect.hasAssertions();

    const send = vi
      .fn<(context: AInvocationContext, data: z.infer<typeof schema>) => Promise<void>>()
      .mockResolvedValue();
    const handler = createEventGridNotificationHandler(AzureFunction.ProcessPushNotification, schema, send, () => "");

    await handler(createEvent(), context);

    expect(send).toHaveBeenCalledExactlyOnceWith(context, data);
  });

  test("rethrows a failing send so Event Grid redelivers the event", async () => {
    expect.hasAssertions();

    const error = new Error("error");
    const send = vi
      .fn<(context: AInvocationContext, data: z.infer<typeof schema>) => Promise<void>>()
      .mockRejectedValue(error);
    const handler = createEventGridNotificationHandler(AzureFunction.ProcessPushNotification, schema, send, () => "");

    await expect(handler(createEvent(), context)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: ${error.message}]`,
    );
  });
});
