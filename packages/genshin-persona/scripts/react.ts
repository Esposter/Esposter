import { checkIsViewerMoment } from "#src/services/checkIsViewerMoment";
import { connectViewer } from "#src/services/connectViewer";
import { getViewerReaction } from "#src/services/getViewerReaction";
import { readViewerConfiguration } from "#src/services/readViewerConfiguration";
import { runHookCommand } from "#src/services/runHookCommand";
import { defineCommand } from "citty";

// The Notification and Stop hooks, each naming its moment on the command line: the model is sent what the reader
// Mapped to that moment, and nothing with no viewer on file, so a machine without one only pays this file check. A
// Hook leaves as soon as it has sent, so the connection is closed behind its last message
await runHookCommand(
  defineCommand({
    args: {
      moment: {
        default: "",
        description: "The moment the hook reaches the model at",
        required: false,
        type: "positional",
      },
    },
    meta: { description: "Send the viewer the reaction to the hook's moment", name: "react" },
    run: async ({ args }) => {
      const moment = checkIsViewerMoment(args.moment) ? args.moment : undefined;
      const configuration = readViewerConfiguration();
      if (!moment || !configuration) return;
      const link = await connectViewer(configuration.address);
      if (!link) return;
      const reaction = getViewerReaction(moment, configuration.motions);
      if (reaction.motion) link.motion(configuration.modelId, reaction.motion);
      if (reaction.isExpressionCleared) link.expressionClear(configuration.modelId);
      link.close();
    },
  }),
);
