import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// Bot Fight Mode stays off: on the free plan it challenges every datacenter caller zone-wide with no rule able to exempt a
// Host, which refuses the webhooks, the call provider's participant events, agent clients and CI's reads of the assets
// Hosts alike
export const esposterComBotManagement: cloudflare.BotManagement = new cloudflare.BotManagement(
  "esposter.com-bot-management",
  { aiBotsProtection: "disabled", enableJs: true, fightMode: false, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
