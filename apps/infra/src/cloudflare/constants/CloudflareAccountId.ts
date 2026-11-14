import { configuration } from "#src/configuration";

// Both stacks' Cloudflare resources sit in one account, so its id is read once here rather than per resource
const CloudflareAccountId: string = configuration.require("cloudflareAccountId");

export default CloudflareAccountId;
