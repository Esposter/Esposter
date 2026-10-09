import type { RateLimitView } from "#src/models/coderabbit/collect/RateLimitView";

import { OUTAGE_RETRY_DELAY_SECONDS, RETRIGGER_BUFFER_MS } from "#src/services/coderabbit/collect/constants";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { GITHUB_RATE_LIMIT_REGEX } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";
import { spawnSync } from "node:child_process";

// How long a run GitHub refused waits for the next (`GITHUB_OUTAGE_REGEX`). A server error states nothing, so it waits
// `OUTAGE_RETRY_DELAY_SECONDS`. A rate limit's end is GitHub's to state, and `gh` prints none of a refusal's headers,
// So `rate_limit` is asked with them — which spends nothing of the primary limit: a secondary limit still in force
// Refuses it too, with the seconds to wait in `Retry-After`, and a primary one shows as a resource with nothing left,
// Its `reset` the epoch seconds `x-ratelimit-reset` carries; the latest of those is the wait. A probe stating neither,
// The limit lifted meanwhile or the probe itself refused without the header, leaves the five minutes
export const readOutageRetryDelaySeconds = (message: string): number => {
  if (!GITHUB_RATE_LIMIT_REGEX.test(message)) return OUTAGE_RETRY_DELAY_SECONDS;

  const { stdout } = spawnSync("gh", ["api", "--include", "rate_limit"], { encoding: "utf8" });
  // The headers, then a blank line, then the body
  const [head = "", body = ""] = stdout.split(/\r?\n\r?\n/u, 2);
  const retryAfterSeconds = /^Retry-After: (?<seconds>\d+)\r?$/imu.exec(head)?.groups?.seconds;
  if (retryAfterSeconds)
    return getRetriggerDelaySeconds(
      Temporal.Duration.from({ seconds: Number(retryAfterSeconds) }).total("milliseconds") + RETRIGGER_BUFFER_MS,
    );

  // A body that is no JSON, an HTML page from GitHub's edge, states no reset
  const { resources = {} }: RateLimitView = getResult(() => parseMachineJson<RateLimitView>(body)).unwrapOr({});
  const resetAtSeconds = Math.max(
    ...Object.values(resources)
      .filter(({ remaining }) => remaining === 0)
      .map(({ reset }) => reset),
  );
  return Number.isFinite(resetAtSeconds)
    ? getRetriggerDelaySeconds(
        Temporal.Duration.from({ seconds: resetAtSeconds }).total("milliseconds") - Date.now() + RETRIGGER_BUFFER_MS,
      )
    : OUTAGE_RETRY_DELAY_SECONDS;
};
