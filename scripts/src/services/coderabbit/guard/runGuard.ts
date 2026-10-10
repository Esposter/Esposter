import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { openCollectorIssue } from "#src/services/coderabbit/collect/openCollectorIssue";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { writeJobOutput } from "#src/services/coderabbit/collect/writeJobOutput";
import { GUARD_HELD_MARKER, GUARD_SETUP_RED_STREAK, IS_WAKING_OUTPUT } from "#src/services/coderabbit/guard/constants";
import { readHeldStreak } from "#src/services/coderabbit/guard/readHeldStreak";
import { getResult } from "@esposter/shared";

// The guard's one decision after a collect job that failed or was killed: wake the cycle, or, when the newest runs keep
// Failing on the same red, open one issue on it and wake nothing. The hold is written only once the issue is open: one
// GitHub refuses throws with the output unwritten, which the workflow reads as a wake, since a hold no issue reports
// Would leave the cycle asleep with nobody told. A guard that cannot read the runs wakes the cycle, as it did before it
// Could tell; the next event or push wakes it either way
export const runGuard = (): void => {
  const streak = getResult(() => readHeldStreak())
    .orTee(console.error)
    .unwrapOr(undefined);
  if (streak === undefined) {
    writeJobOutput(IS_WAKING_OUTPUT, "true");
    return;
  }

  console.info(`held: ${streak.signature.text}`);
  openCollectorIssue({
    body: [
      `The newest collector runs all failed on the same red, so the guard stopped waking the cycle after them: ${streak.signature.text}`,
      ...(streak.isSetup
        ? [
            "",
            `Each failed in a step that fetches the code or its toolchain, which GitHub or the network fails only for a while, so the guard held after ${GUARD_SETUP_RED_STREAK} of them in a row. The likely causes: \`REVIEW_COLLECTOR_TOKEN\` expired, which a person renews (\`gh auth refresh\`, then the secret set again); a lockfile the frozen install refuses; or a broken composite action under \`.github/actions\`.`,
          ]
        : []),
      "",
      "The next push to `ai/queue` or event the collector listens to wakes it as usual, and a run that succeeds ends the streak. Land the fix in one push with the collector's workflow off (the `review-queue` skill, `references/running-by-hand.md`), then close this issue.",
    ].join("\n"),
    isDryRun: false,
    marker: getMarker(GUARD_HELD_MARKER, streak.signature),
    title: `Collector red: ${streak.signature.text}`,
    viewerLogin: readViewerLogin(),
  });
  writeJobOutput(IS_WAKING_OUTPUT, "false");
};
