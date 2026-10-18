import { ViewerMoments } from "#src/models/ViewerMoment";
import { connectViewer } from "#src/services/connectViewer";
import { getViewerReaction } from "#src/services/getViewerReaction";
import { readViewerConfiguration } from "#src/services/readViewerConfiguration";
import { registerQuietExit } from "#src/services/registerQuietExit";

// The Notification and Stop hooks, each naming its moment on the command line: the model is sent what the reader
// Mapped to that moment, and nothing with no viewer on file, so a machine without one only pays this file check. A
// Hook leaves as soon as it has sent, so the connection is closed behind its last message
registerQuietExit();
const moment = ViewerMoments.find((candidate) => candidate === process.argv[2]);
const configuration = readViewerConfiguration();
if (moment && configuration) {
  const link = await connectViewer(configuration.address);
  if (link) {
    const reaction = getViewerReaction(moment, configuration.motions);
    if (reaction.motion) link.motion(configuration.modelId, reaction.motion);
    if (reaction.isExpressionCleared) link.expressionClear(configuration.modelId);
    link.close();
  }
}
