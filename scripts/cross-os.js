import { spawn } from "node:child_process";
import packageJson from "../package.json" with { type: "json" };

const minArgv = 3;
const property = "cross-os";
if (process.argv.length < minArgv)
  // pnpm cross-os [args]
  throw new Error(`${property} requires at least ${minArgv - 2} arguments`);

const script = process.argv[2];
const args = process.argv.slice(3, process.argv.length);
const { platform } = process;
const command = packageJson[property][script][platform];
if (!command) throw new Error(`script: "${script}" not found for the current platform: ${platform}`);

const proc = spawn(command, args, { stdio: "inherit", shell: true });
proc.on("exit", (code) => process.exit(code));
