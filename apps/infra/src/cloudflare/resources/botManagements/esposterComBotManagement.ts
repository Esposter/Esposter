import { esposterCom } from "#src/cloudflare/resources/zones/esposterCom";
import * as cloudflare from "@pulumi/cloudflare";

// Bot Fight Mode stays off: on the free plan it challenges every datacenter caller zone-wide with no rule able to exempt a
// Host, which refuses the webhooks, the call provider's participant events, agent clients and CI's reads of the assets
// Hosts alike. JavaScript detections are off with it, since on the free plan Bot Fight Mode is their only reader, and
// They inject a challenge script into every page
export const esposterComBotManagement: cloudflare.BotManagement = new cloudflare.BotManagement(
  "esposter.com-bot-management",
  { aiBotsProtection: "disabled", enableJs: false, fightMode: false, zoneId: esposterCom.id },
  { parent: esposterCom, protect: true },
);
