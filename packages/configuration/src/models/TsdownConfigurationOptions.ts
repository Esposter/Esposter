import type { ExportsGeneration } from "#src/models/ExportsGeneration";

export interface TsdownConfigurationOptions {
  exportsGeneration?: ExportsGeneration;
  // `src`-relative directories whose modules the package loads on demand, so the source barrel leaves them out.
  lazyDirectories?: string[];
}
