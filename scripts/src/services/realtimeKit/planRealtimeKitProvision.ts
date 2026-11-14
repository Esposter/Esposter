import type { RealtimeKitAction } from "#src/models/realtimeKit/RealtimeKitAction";
import type { RealtimeKitDesired } from "#src/models/realtimeKit/RealtimeKitDesired";
import type { RealtimeKitExisting } from "#src/models/realtimeKit/RealtimeKitExisting";
import type { RealtimeKitWebhook } from "#src/models/realtimeKit/RealtimeKitWebhook";

// A webhook is current when it is enabled and subscribed to exactly the events the route is subscribed to
const checkIsWebhookCurrent = (webhook: RealtimeKitWebhook, events: string[]): boolean =>
  webhook.enabled && webhook.events.length === events.length && events.every((event) => webhook.events.includes(event));

// The changes that take an environment's RealtimeKit from what exists to what is desired, in the order they run:
// The app first, since its presets and webhook belong to it. The app id is written last, once everything it names exists.
// What is missing or stale is planned, so a second run over a provisioned environment plans nothing
export const planRealtimeKitProvision = (
  desired: RealtimeKitDesired,
  existingState: RealtimeKitExisting,
): RealtimeKitAction[] => {
  const actions: RealtimeKitAction[] = [];
  if (!existingState.app) actions.push({ kind: "createApp" });
  for (const preset of desired.presets)
    if (!existingState.presets.some(({ name }) => name === preset.name)) actions.push({ kind: "createPreset", preset });

  const webhook = existingState.webhooks.find(({ url }) => url === desired.webhookUrl);
  if (!webhook) actions.push({ kind: "createWebhook" });
  else if (!checkIsWebhookCurrent(webhook, desired.webhookEvents))
    actions.push({ id: webhook.id, kind: "updateWebhook" });

  // A token's value is only ever returned when it is made, so a token that exists is rolled when ESC does not hold its
  // Value, and left alone when it does
  if (!existingState.token) actions.push({ kind: "createToken" });
  else if (!existingState.isEscTokenSet) actions.push({ id: existingState.token.id, kind: "rollToken" });

  if (!existingState.app || existingState.escAppId !== existingState.app.id) actions.push({ kind: "setAppId" });
  return actions;
};
