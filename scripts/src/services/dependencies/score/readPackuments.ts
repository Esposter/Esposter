import type { Packument } from "#src/models/dependencies/score/Packument";
import type { RegistryCheckError } from "#src/models/shared/RegistryCheckError";

import { REGISTRY_CONCURRENCY } from "#src/services/outdatedDependencies/registry/constants";
import { fetchRegistry } from "#src/services/shared/fetchRegistry";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { getResultAsync } from "@esposter/shared";

export const readPackuments = async (
  packageNames: string[],
): Promise<{ errors: RegistryCheckError[]; packuments: Map<string, Packument> }> => {
  const errors: RegistryCheckError[] = [];
  const packuments = new Map<string, Packument>();

  await forEachConcurrently(packageNames, REGISTRY_CONCURRENCY, async (packageName) => {
    await getResultAsync(() => fetchRegistry<Packument>(packageName)).match(
      (packument) => {
        packuments.set(packageName, packument);
      },
      (error) => {
        errors.push({ error: error.message, packageName });
      },
    );
  });

  return { errors, packuments };
};
