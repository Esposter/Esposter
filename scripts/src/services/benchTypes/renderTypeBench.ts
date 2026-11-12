import { TSRS_VERSION } from "#src/services/benchTypes/constants";
import { formatTypeBenchMarkdown } from "#src/services/benchTypes/formatTypeBenchMarkdown";
import { measureTypeBench } from "#src/services/benchTypes/measureTypeBench";

export const renderTypeBench = async (sourcePath: string): Promise<string> =>
  formatTypeBenchMarkdown(await measureTypeBench(sourcePath), TSRS_VERSION);
