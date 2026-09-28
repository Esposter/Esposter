// Places the SDK's own Windows Claude Code binary where the single executable's build embeds it as an asset
import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const sdkRequire = createRequire(createRequire(import.meta.url).resolve("@anthropic-ai/claude-agent-sdk"));
const platformPackageDirectory = dirname(sdkRequire.resolve("@anthropic-ai/claude-agent-sdk-win32-x64/package.json"));
copyFileSync(join(platformPackageDirectory, "claude.exe"), join(import.meta.dirname, "..", "dist-sea", "claude.exe"));
