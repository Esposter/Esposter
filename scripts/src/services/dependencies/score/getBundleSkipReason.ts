import type { BundleScope } from "#src/models/dependencies/score/BundleScope";

import { TYPES_SCOPE } from "#src/services/dependencies/score/constants";

// Why a package's cost is not measured, or undefined when it is: a declarations package, a Nuxt module, nothing that
// Imports it, one only the server imports, or one only a test imports
export const getBundleSkipReason = ({
  clientImporterCount,
  importerCount,
  isNuxtModule,
  isTypesOnly,
  packageName,
  valueClientImporterCount,
}: BundleScope): string | undefined => {
  if (isTypesOnly || packageName.startsWith(TYPES_SCOPE)) return "types-only";
  if (isNuxtModule) return "Nuxt module";
  if (importerCount === 0) return "not imported";
  if (clientImporterCount === 0) return "server-only";
  if (valueClientImporterCount === 0) return "dev-only";
  return undefined;
};
