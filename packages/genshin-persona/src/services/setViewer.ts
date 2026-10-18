import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";
import type { ViewerLink } from "#src/models/ViewerLink";

import { VIEWER_DEFAULT_FRAME_COLOR, VIEWER_PROOF_DURATION_MS, VIEWER_TEXT_COLOR } from "#src/services/constants";

export interface SetViewerDependencies {
  connect: (address: string) => Promise<ViewerLink | undefined>;
  proofText: string;
  readConfiguration: () => ViewerConfiguration | undefined;
  writeConfiguration: (configuration: ViewerConfiguration) => void;
}

// The `viewer` verb's address: a viewer that answers shows one bubble to prove the connection and is written down with
// The motions already mapped; one that does not answer writes nothing
export const setViewer = async (
  address: string,
  modelId: number,
  { connect, proofText, readConfiguration, writeConfiguration }: SetViewerDependencies,
): Promise<boolean> => {
  const link = await connect(address);
  if (!link) return false;

  link.bubble(modelId, proofText, VIEWER_PROOF_DURATION_MS, VIEWER_DEFAULT_FRAME_COLOR, VIEWER_TEXT_COLOR);
  writeConfiguration({ address, modelId, motions: readConfiguration()?.motions ?? {} });
  link.close();
  return true;
};
