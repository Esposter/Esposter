import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { ViewerMoments } from "#src/models/ViewerMoment";
import { checkIsViewerAddress } from "#src/services/checkIsViewerAddress";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { connectViewer } from "#src/services/connectViewer";
import { VIEWER_DEFAULT_MODEL_ID } from "#src/services/constants";
import { readViewerConfiguration } from "#src/services/readViewerConfiguration";
import { setViewer } from "#src/services/setViewer";
import { writeViewerConfiguration } from "#src/services/writeViewerConfiguration";
import { defineCommand } from "citty";

// `viewer` alone reports the viewer on file, `viewer <address> [model]` sets it and proves the connection with one
// Bubble, and `viewer motions <moment> [group:motion]` maps a motion to a moment, or unmaps it when no motion is given
export const viewerCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Viewer },
  run: async ({ args }) => {
    const { strings } = await readGenshinContext();
    const [first = "", ...rest] = args._;
    const configuration = readViewerConfiguration();
    if (!first) {
      console.log(
        configuration ? strings.viewerStatus(configuration.address, configuration.modelId) : strings.viewerNone,
      );
      return;
    }

    if (first === "motions") {
      const [momentName = "", motion = ""] = rest;
      const moment = ViewerMoments.find((candidate) => candidate === momentName);
      if (!moment) {
        console.error(strings.viewerMomentInvalid(ViewerMoments.join(", ")));
        process.exitCode = 1;
        return;
      }

      if (!configuration) {
        console.error(strings.viewerNone);
        process.exitCode = 1;
        return;
      }

      writeViewerConfiguration({
        ...configuration,
        motions: { ...configuration.motions, [moment]: motion || undefined },
      });
      console.log(motion ? strings.viewerMotionSet(moment, motion) : strings.viewerMotionCleared(moment));
      return;
    }

    const modelId = rest[0] ? Number(rest[0]) : VIEWER_DEFAULT_MODEL_ID;
    if (!checkIsViewerAddress(first)) {
      console.error(strings.viewerAddressInvalid(first));
      process.exitCode = 1;
      return;
    }

    if (!Number.isInteger(modelId) || modelId < 0) {
      console.error(strings.viewerModelInvalid);
      process.exitCode = 1;
      return;
    }

    const isSet = await setViewer(first, modelId, {
      connect: connectViewer,
      proofText: strings.viewerProof,
      readConfiguration: readViewerConfiguration,
      writeConfiguration: writeViewerConfiguration,
    });
    if (isSet) console.log(strings.viewerSet(first));
    else {
      console.error(strings.viewerNotAnswering(first));
      process.exitCode = 1;
    }
  },
});
