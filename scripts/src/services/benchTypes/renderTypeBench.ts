import { formatTypeBenchMarkdown } from "#src/services/benchTypes/formatTypeBenchMarkdown";
import { measureTypeBench } from "#src/services/benchTypes/measureTypeBench";
import { TYPESCRIPT_VERSION } from "#src/services/benchTypes/constants";

export const renderTypeBench = (sourcePath: string): string =>
  formatTypeBenchMarkdown(measureTypeBench(sourcePath), TYPESCRIPT_VERSION);
