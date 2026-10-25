import { FLOW_START_REGEX } from "#src/services/genshinAssets/kits/gcsim/constants";
import { parseFlow } from "#src/services/genshinAssets/kits/gcsim/parseFlow";
import { parseScalar } from "#src/services/genshinAssets/kits/gcsim/parseScalar";

export const parseValue = (text: string): unknown =>
  FLOW_START_REGEX.test(text) ? parseFlow(text) : parseScalar(text);
