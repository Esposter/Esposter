import type { RealtimeKitExisting } from "#src/models/realtimeKit/RealtimeKitExisting";

import { getRealtimeKitDesired } from "#src/services/realtimeKit/getRealtimeKitDesired";
import { planRealtimeKitProvision } from "#src/services/realtimeKit/planRealtimeKitProvision";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(planRealtimeKitProvision, () => {
  const desired = getRealtimeKitDesired(CloudflareEnvironment.Development);
  const appId = crypto.randomUUID();
  const tokenId = crypto.randomUUID();
  const webhook = { enabled: true, events: desired.webhookEvents, id: crypto.randomUUID(), url: desired.webhookUrl };
  const provisioned: RealtimeKitExisting = {
    app: { id: appId, name: desired.appName },
    escAppId: appId,
    isEscTokenSet: true,
    presets: desired.presets.map(({ name }) => ({ id: crypto.randomUUID(), name })),
    token: { id: tokenId, name: desired.tokenName },
    webhooks: [webhook],
  };

  test("creates the app, then its presets and webhook, then the token and the app id, when nothing exists", () => {
    expect.hasAssertions();

    expect(planRealtimeKitProvision(desired, { isEscTokenSet: false, presets: [], webhooks: [] })).toStrictEqual([
      { kind: "createApp" },
      ...desired.presets.map((preset) => ({ kind: "createPreset", preset })),
      { kind: "createWebhook" },
      { kind: "createToken" },
      { kind: "setAppId" },
    ]);
  });

  test("plans nothing for an environment already provisioned", () => {
    expect.hasAssertions();

    expect(planRealtimeKitProvision(desired, provisioned)).toStrictEqual([]);
  });

  test("creates only the presets the app is missing", () => {
    expect.hasAssertions();

    const [missingPreset] = desired.presets;
    expect(planRealtimeKitProvision(desired, { ...provisioned, presets: provisioned.presets.slice(1) })).toStrictEqual([
      { kind: "createPreset", preset: missingPreset },
    ]);
  });

  test("updates a webhook that is disabled", () => {
    expect.hasAssertions();

    expect(
      planRealtimeKitProvision(desired, { ...provisioned, webhooks: [{ ...webhook, enabled: false }] }),
    ).toStrictEqual([{ id: webhook.id, kind: "updateWebhook" }]);
  });

  test("updates a webhook subscribed to other events", () => {
    expect.hasAssertions();

    expect(planRealtimeKitProvision(desired, { ...provisioned, webhooks: [{ ...webhook, events: [] }] })).toStrictEqual(
      [{ id: webhook.id, kind: "updateWebhook" }],
    );
  });

  test("rolls an existing token when ESC does not hold its value, since that value is never read back", () => {
    expect.hasAssertions();

    expect(planRealtimeKitProvision(desired, { ...provisioned, isEscTokenSet: false })).toStrictEqual([
      { id: tokenId, kind: "rollToken" },
    ]);
  });

  test("writes the app id when ESC holds a different one", () => {
    expect.hasAssertions();

    expect(planRealtimeKitProvision(desired, { ...provisioned, escAppId: "-1" })).toStrictEqual([{ kind: "setAppId" }]);
  });
});
