import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { openCollectorIssue } from "#src/services/coderabbit/collect/openCollectorIssue";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { writeJobOutput } from "#src/services/coderabbit/collect/writeJobOutput";
import { GUARD_HELD_MARKER, IS_WAKING_OUTPUT } from "#src/services/coderabbit/guard/constants";
import { readHeldSignature } from "#src/services/coderabbit/guard/readHeldSignature";
import { getResult } from "@esposter/shared";
import { defineCommand, runMain } from "citty";

// `pnpm ai:coderabbit:guard` — the guard's one decision after a collect job that failed or was killed: wake the cycle,
// Or, when the newest runs keep failing on the same red, open one issue on it and wake nothing. A guard that cannot
// Read the runs wakes the cycle, as it did before it could tell; the next event or push wakes it either way
await runMain(
  defineCommand({
    meta: {
      description: "Whether the review collector's guard wakes the cycle after a red or killed run",
      name: "ai:coderabbit:guard",
    },
    run: () => {
      const signature = getResult(() => readHeldSignature())
        .orTee(console.error)
        .unwrapOr(undefined);
      writeJobOutput(IS_WAKING_OUTPUT, (signature === undefined).toString());
      if (signature === undefined) return;

      console.info(`held: ${signature.text}`);
      openCollectorIssue({
        body: [
          `The newest collector runs all failed on the same red, so the guard stopped waking the cycle after them: ${signature.text}`,
          "",
          "The next push to `ai/queue` or event the collector listens to wakes it as usual, and a run that succeeds ends the streak. Land the fix in one push with the collector's workflow off (the `review-queue` skill, `references/running-by-hand.md`), then close this issue.",
        ].join("\n"),
        isDryRun: false,
        marker: getMarker(GUARD_HELD_MARKER, signature),
        title: `Collector red: ${signature.text}`,
        viewerLogin: readViewerLogin(),
      });
    },
  }),
);
