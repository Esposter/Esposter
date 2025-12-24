import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import packageJsonType from "../package.json" with { type: "json" };

const minArgv = 3;
const property = "crossOS";
if (process.argv.length < minArgv)
  // Pnpm crossOS [args]
  throw new Error(`${property} requires at least ${minArgv - 2} arguments`);

const script = process.argv[2];
const args = process.argv.slice(3);
const { platform } = process;
const require = createRequire(import.meta.url);
const packageJson = require(resolve(process.cwd(), "package.json")) as typeof packageJsonType;
const command = (packageJson[property] as Record<string, Record<string, string | undefined>>)[script][platform];
if (!command) throw new Error(`script: "${script}" not found for the current platform: ${platform}`);

const proc = spawn(command, args, { shell: true, stdio: "inherit" });
proc.on("exit", (code) => process.exit(code));
