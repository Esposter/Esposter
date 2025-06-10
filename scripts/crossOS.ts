import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const minArgv = 3;
const property = "crossOS";
if (process.argv.length < minArgv)
  // bun crossOS [args]
  throw new Error(`${property} requires at least ${minArgv - 2} arguments`);

const script = process.argv[2];
const args = process.argv.slice(3, process.argv.length);
const { platform } = process;
const require = createRequire(import.meta.url);
const packageJson = require(resolve(process.cwd(), "package.json"));
const command = packageJson[property][script][platform];
if (!command) throw new Error(`script: "${script}" not found for the current platform: ${platform}`);

const proc = spawn(command, args, { shell: true, stdio: "inherit" });
proc.on("exit", (code) => process.exit(code));
