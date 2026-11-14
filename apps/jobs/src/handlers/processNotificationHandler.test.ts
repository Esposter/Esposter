import { processNotificationHandler } from "#src/handlers/processNotificationHandler";
import { sendNotification } from "#src/services/notification/sendNotification";
import { AppNotificationType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

// The fan-out is sendNotification's own suite. This one owns the boundary a queue body crosses and the hand-off.
// It also owns the throw that asks the queue to redeliver.
vi.mock(import("#src/services/notification/sendNotification"), () => ({
  sendNotification: vi.fn<typeof sendNotification>(),
}));

describe(processNotificationHandler, () => {
  const path = "path";
  const title = "title";
  const userId = v7();
  const delivery = { attempt: 0, path, title, type: AppNotificationType.ResourceOperation, userId };

  afterEach(() => {
    vi.mocked(sendNotification).mockClear();
  });

  test("hands the parsed delivery to sendNotification", async () => {
    expect.hasAssertions();

    await processNotificationHandler(delivery);

    expect(sendNotification).toHaveBeenCalledExactlyOnceWith(delivery);
  });

  test("rejects a body the queue does not carry, before anything is sent", async () => {
    expect.hasAssertions();

    await expect(processNotificationHandler({ type: " " })).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_union",
          "errors": [],
          "note": "No matching discriminator",
          "discriminator": "type",
          "options": [
            "FriendRequest",
            "Message",
            "Reminder",
            "ResourceOperation",
            "TodoReminder"
          ],
          "path": [
            "type"
          ],
          "message": "Invalid discriminator value. Expected 'FriendRequest' | 'Message' | 'Reminder' | 'ResourceOperation' | 'TodoReminder'"
        }
      ]]
    `);

    expect(sendNotification).not.toHaveBeenCalled();
  });

  test("rethrows a failed send so the queue redelivers the notification", async () => {
    expect.hasAssertions();

    vi.mocked(sendNotification).mockRejectedValueOnce(new Error(" "));

    await expect(processNotificationHandler(delivery)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
  });
});
