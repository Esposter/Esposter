import type { ViewerConfiguration } from "#src/models/ViewerConfiguration";

import { VIEWER_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";

export const writeViewerConfiguration = (configuration: ViewerConfiguration): void => {
  writeStateFile(VIEWER_PATH, JSON.stringify(configuration));
};
