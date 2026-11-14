import { configuration } from "#src/configuration";

// The zone the custom domains under `esposter.com` are routed in
const CloudflareZoneId: string = configuration.require("cloudflareZoneId");

export default CloudflareZoneId;
