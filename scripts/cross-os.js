import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const minArgv = 3;
const property = "cross-os";
if (process.argv.length < minArgv)
  // pnpm cross-os [args]
  throw new Error(`${property} requires at least ${minArgv - 2} arguments`);

const script = process.argv[2];
const args = process.argv.slice(3, process.argv.length);
const { platform } = process;
const require = createRequire(import.meta.url);
const packageJson = require(path.resolve(process.cwd(), "package.json"));
const command = packageJson[property][script][platform];
if (!command) throw new Error(`script: "${script}" not found for the current platform: ${platform}`);

const proc = spawn(command, args, { stdio: "inherit", shell: true });
proc.on("exit", (code) => process.exit(code));
