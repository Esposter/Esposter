import { getCreateMessageNotificationPayload } from "#src/services/getCreateMessageNotificationPayload";
import { getPushNotificationPayload } from "#src/services/getPushNotificationPayload";
import { InvocationContext } from "@azure/functions";
import { describe, expect, test } from "vitest";

// The envelope — absolute url, icon/title omission and the body cap — is getPushNotificationPayload's own
// Suite; what this one owns is the text pulled out of message html before it is handed over.
describe(getCreateMessageNotificationPayload, () => {
  const context = new InvocationContext();
  const icon = "icon";
  const path = "path";
  const title = "title";

  test("returns undefined when message has no text content", () => {
    expect.hasAssertions();

    expect(getCreateMessageNotificationPayload(context, "<p></p>", { path })).toBeUndefined();
    expect(getCreateMessageNotificationPayload(context, "", { path })).toBeUndefined();
  });

  test("extracts text from paragraph and serializes payload", () => {
    expect.hasAssertions();

    expect(getCreateMessageNotificationPayload(context, "<p>a</p>", { icon, path, title })).toBe(
      getPushNotificationPayload({ body: "a", icon, path, title }),
    );
  });

  test("extracts text from plain-text webhook content without a paragraph wrapper", () => {
    expect.hasAssertions();

    expect(getCreateMessageNotificationPayload(context, "a", { icon, path, title })).toBe(
      getPushNotificationPayload({ body: "a", icon, path, title }),
    );
  });
});
