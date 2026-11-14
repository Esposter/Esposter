import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import { configuration } from "#src/configuration";
import * as cloudflare from "@pulumi/cloudflare";

// The account's billing usage alert, one for both stacks since they share the account. It notifies and nothing else: the
// Azure budget guards stopped the Function App at their ceiling, and nothing here does.
export const billingUsageAlert: cloudflare.NotificationPolicy = new cloudflare.NotificationPolicy(
  "notificationPolicy-billing-usage-alert",
  {
    accountId: CloudflareAccountId,
    alertType: "billing_usage_alert",
    description: "Billing usage on the paid plan",
    enabled: true,
    mechanisms: { emails: [{ id: configuration.require("cloudflareBillingAlertEmail") }] },
    name: "billing-usage-alert",
  },
  { protect: true },
);
