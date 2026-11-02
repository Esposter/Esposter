import { GIBIBYTE } from "#src/services/machine/constants";
import {
  REVIEW_HEARTBEAT_COMMAND_CHARACTER_LIMIT,
  REVIEW_HEARTBEAT_INTERVAL_MS,
  REVIEW_HEARTBEAT_PROCESS_COUNT,
} from "#src/services/review/constants";
import { MEBIBYTE } from "#src/services/shared/constants";
import { KIBIBYTE } from "@esposter/configuration";
import { getResult, noop } from "@esposter/shared";
import { execFileSync } from "@esposter/shared-node/child-process";
import { statfsSync } from "node:fs";
import { freemem, totalmem } from "node:os";

const logRunnerResources = (): void => {
  const { bavail, bsize } = statfsSync("/");
  const heaviestProcesses = execFileSync("ps", ["-eo", "rss=,args=", "--sort=-rss"], { encoding: "utf8" })
    .split("\n")
    .slice(0, REVIEW_HEARTBEAT_PROCESS_COUNT)
    .map((line) => line.trim())
    .map((line) => {
      const [rss = "0", ...command] = line.split(" ");
      return `${Math.round(Number(rss) / KIBIBYTE)} MiB ${command.join(" ").slice(0, REVIEW_HEARTBEAT_COMMAND_CHARACTER_LIMIT)}`;
    });
  console.info(
    `runner: ${Math.round(freemem() / MEBIBYTE)} of ${Math.round(totalmem() / MEBIBYTE)} MiB memory free, ${((bavail * bsize) / GIBIBYTE).toFixed(1)} GiB disk free; heaviest: ${heaviestProcesses.join("; ")}`,
  );
};

// A line a minute of what the runner has left and what holds it, for the job that runs a session. A session's output comes
// Back whole when it ends, so a runner that shuts down mid-session leaves the job log with no word of what was running.
export const startRunnerResourceHeartbeat = (): void => {
  setInterval(() => {
    getResult(logRunnerResources).match(noop, console.error);
  }, REVIEW_HEARTBEAT_INTERVAL_MS).unref();
};
