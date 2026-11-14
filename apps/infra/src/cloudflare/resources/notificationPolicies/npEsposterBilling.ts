import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { configuration } from "#src/configuration";
import { CloudflareAssetType, getCloudflareAccountResourceName } from "@esposter/db-schema";
import * as cloudflare from "@pulumi/cloudflare";

const notificationPolicyName = getCloudflareAccountResourceName(CloudflareAssetType.NotificationPolicy, "billing");

// The account's billing usage alert, one for both stacks since they share the account. It notifies and nothing else: the
// Azure budget guards stopped the Function App at their ceiling, and nothing here does.
export const npEsposterBilling: cloudflare.NotificationPolicy = new cloudflare.NotificationPolicy(
  notificationPolicyName,
  {
    accountId: CloudflareAccountId,
    alertType: "billing_usage_alert",
    description: "Billing usage on the paid plan",
    enabled: true,
    mechanisms: { emails: [{ id: configuration.require("cloudflareBillingAlertEmail") }] },
    name: notificationPolicyName,
  },
  { protect: true },
);
