import { readComposableWithoutReactivityFindings } from "#src/services/sweeps/composableWithoutReactivity/readComposableWithoutReactivityFindings";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Prints rather than exits non-zero: the pass reads the list, and a composable with no reactive call is a finding
// For the pass to judge, not a failure. A clean tree prints nothing.
await runCommand(
  defineCommand({
    meta: {
      description: "Print each app composable with no reactive call, lifecycle hook or composable call in it",
      name: "ai:sweep:composable-without-reactivity",
    },
    run: () => {
      for (const finding of readComposableWithoutReactivityFindings()) console.info(finding);
    },
  }),
);
