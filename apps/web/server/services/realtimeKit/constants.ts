// The public key RealtimeKit signs its webhook deliveries with
export const REALTIMEKIT_WEBHOOK_KEY_URL = "https://api.realtime.cloudflare.com/.well-known/webhooks.json";
// The signature RealtimeKit makes each delivery's raw body with: RSASSA-PKCS1-v1_5 over SHA-256
export const REALTIMEKIT_WEBHOOK_ALGORITHM = { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" };
