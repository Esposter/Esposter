// Places the SDK's own Windows Claude Code binary beside the single executable, where the installed host runs it from
import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const sdkRequire = createRequire(createRequire(import.meta.url).resolve("@anthropic-ai/claude-agent-sdk"));
const platformPackageDirectory = dirname(sdkRequire.resolve("@anthropic-ai/claude-agent-sdk-win32-x64/package.json"));
copyFileSync(join(platformPackageDirectory, "claude.exe"), join(import.meta.dirname, "..", "dist-sea", "claude.exe"));
