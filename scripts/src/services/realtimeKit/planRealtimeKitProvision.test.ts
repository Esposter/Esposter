import type { RealtimeKitExisting } from "#src/models/realtimeKit/RealtimeKitExisting";

import { getRealtimeKitDesired } from "#src/services/realtimeKit/getRealtimeKitDesired";
import { planRealtimeKitProvision } from "#src/services/realtimeKit/planRealtimeKitProvision";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(planRealtimeKitProvision, () => {
  const desired = getRealtimeKitDesired(CloudflareEnvironment.Development);
  const appId = v7();
  const webhook = { enabled: true, events: desired.webhookEvents, id: v7(), url: desired.webhookUrl };
  const provisioned: RealtimeKitExisting = {
    app: { id: appId, name: desired.appName },
    escAppId: appId,
    presets: desired.presets.map(({ name }) => ({ id: v7(), name })),
    webhooks: [webhook],
  };

  test("creates the app, then its presets and webhook, then the app id, when nothing exists", () => {
    expect.hasAssertions();

    expect(planRealtimeKitProvision(desired, { presets: [], webhooks: [] })).toStrictEqual([
      { kind: "createApp" },
      ...desired.presets.map((preset) => ({ kind: "createPreset", preset })),
      { kind: "createWebhook" },
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

  test("writes the app id when ESC holds a different one", () => {
    expect.hasAssertions();

    expect(planRealtimeKitProvision(desired, { ...provisioned, escAppId: "-1" })).toStrictEqual([{ kind: "setAppId" }]);
  });
});
