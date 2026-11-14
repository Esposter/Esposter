import type { CloudflareEnvironment } from "@esposter/db-schema";

import { applyRealtimeKitActions } from "#src/services/realtimeKit/applyRealtimeKitActions";
import { describeRealtimeKitAction } from "#src/services/realtimeKit/describeRealtimeKitAction";
import { getRealtimeKitDesired } from "#src/services/realtimeKit/getRealtimeKitDesired";
import { planRealtimeKitProvision } from "#src/services/realtimeKit/planRealtimeKitProvision";
import { readCloudflareCredentials } from "#src/services/realtimeKit/readCloudflareCredentials";
import { readPermissionGroupId } from "#src/services/realtimeKit/readPermissionGroupId";
import { readRealtimeKitExisting } from "#src/services/realtimeKit/readRealtimeKitExisting";
import { requirePulumiLogin } from "#src/services/realtimeKit/requirePulumiLogin";

// Brings one environment's RealtimeKit to what the calls code expects, reading everything first so the plan is made
// Against the state it will change. A dry run prints the plan and stops before the first write
export const provisionRealtimeKit = async (environment: CloudflareEnvironment, isDryRun: boolean): Promise<void> => {
  const credentials = readCloudflareCredentials();
  await requirePulumiLogin();
  const desired = getRealtimeKitDesired(environment);
  const permissionGroupId = await readPermissionGroupId(credentials);
  const existingState = await readRealtimeKitExisting(credentials, environment, desired);
  const actions = planRealtimeKitProvision(desired, existingState);

  if (actions.length === 0) {
    console.log(`RealtimeKit for ${environment} is already provisioned: nothing to change.`);
    return;
  }
  for (const action of actions)
    console.log(`${isDryRun ? "Would" : "Will"}: ${describeRealtimeKitAction(action, desired)}`);
  if (isDryRun) {
    console.log(`Dry run for ${environment}: nothing was written.`);
    return;
  }
  await applyRealtimeKitActions(credentials, environment, desired, permissionGroupId, existingState, actions);
  console.log(`RealtimeKit for ${environment} is provisioned.`);
};
