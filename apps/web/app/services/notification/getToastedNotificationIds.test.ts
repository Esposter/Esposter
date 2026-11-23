import type { AppNotification } from "#src/models/notification/AppNotification";

import { getToastedNotificationIds } from "#src/services/notification/getToastedNotificationIds";
import { NotificationSeverity } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getToastedNotificationIds, () => {
  const title = "title";
  const epoch = new Date(0);
  const nextDay = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
  const createDeliveredNotification = (id: string, createdAt: Date): AppNotification => ({
    body: "",
    createdAt,
    id,
    isRead: false,
    path: "",
    severity: NotificationSeverity.Info,
    title,
  });

  test("toasts only the newest row of an answer a tab holding nothing is given", () => {
    expect.hasAssertions();

    const olderNotification = createDeliveredNotification(v7(), epoch);
    const pushedNotification = createDeliveredNotification(v7(), nextDay);

    expect(getToastedNotificationIds([], [pushedNotification, olderNotification])).toStrictEqual([
      pushedNotification.id,
    ]);
  });

  test("toasts the rows the tab did not hold, oldest first, and never a held row", () => {
    expect.hasAssertions();

    const heldNotification = createDeliveredNotification(v7(), epoch);
    const firstPushedNotification = createDeliveredNotification(v7(), nextDay);
    const secondPushedNotification = createDeliveredNotification(v7(), nextDay);

    expect(
      getToastedNotificationIds(
        [heldNotification],
        [secondPushedNotification, firstPushedNotification, heldNotification],
      ),
    ).toStrictEqual([firstPushedNotification.id, secondPushedNotification.id]);
  });

  // The stored timestamps keep milliseconds, so a row that arrived in the same millisecond as the newest held one ties
  // With it, and only the held ids tell it apart from the row the tab already has
  test("toasts a new row that ties with the newest row held", () => {
    expect.hasAssertions();

    const heldNotification = createDeliveredNotification(v7(), epoch);
    const tiedNotification = createDeliveredNotification(v7(), epoch);

    expect(getToastedNotificationIds([heldNotification], [tiedNotification, heldNotification])).toStrictEqual([
      tiedNotification.id,
    ]);
  });

  // A page the read grew holds rows older than the newest the tab held. They were never pushed to this tab, so they
  // Stay Off the toast, though the tab did not hold them
  test("does not toast a row older than the newest held one, which a grown page brings", () => {
    expect.hasAssertions();

    const heldNotification = createDeliveredNotification(v7(), nextDay);
    const grownNotification = createDeliveredNotification(v7(), epoch);

    expect(getToastedNotificationIds([heldNotification], [heldNotification, grownNotification])).toStrictEqual([]);
  });
});
