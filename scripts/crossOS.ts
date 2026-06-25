import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import packageJsonType from "../package.json" with { type: "json" };

const minArgv = 3;
const property = "crossOS";
if (process.argv.length < minArgv)
  // Pnpm crossOS [args]
  throw new RangeError(`${property} requires at least ${minArgv - 2} arguments`);

const script = process.argv[2];
if (!script) throw new Error("script is required");

const args = process.argv.slice(3);
const { platform } = process;
const require = createRequire(import.meta.url);
const packageJson = require(resolve(process.cwd(), "package.json")) as typeof packageJsonType;
const command = (packageJson[property] as Record<string, Partial<Record<string, string>>>)[script]?.[platform];
if (!command) throw new Error(`script: "${script}" not found for the current platform: ${platform}`);

// With shell: true, pass a single command string (no args array) — Node deprecates (DEP0190) array
// Args here since they are concatenated unescaped anyway. args are internal, trusted CLI tokens.
const proc = spawn([command, ...args].join(" "), { shell: true, stdio: "inherit" });
proc.on("exit", (code) => process.exit(code));
