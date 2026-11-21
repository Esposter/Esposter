import { LIBRARY_ENTRY_PATH, PACKAGE_NAME_REGEX, PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { toCamelCase } from "#src/services/package/new/toCamelCase";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";

// A name is refused before anything is written when it is not a valid package name or a directory of it already exists.
// Writing over an existing package would leave the member tests reading two packages as one
export const validatePackageName = (name: string, root: string): void => {
  if (!PACKAGE_NAME_REGEX.test(name))
    throw new InvalidOperationError(
      Operation.Create,
      "package",
      "the name is lowercase words joined by single hyphens, such as nuxt-security-module",
    );
  // A library's module is named for its package, so a name whose module is the entry the build generates would be written over it
  if (`src/${toCamelCase(name)}.ts` === LIBRARY_ENTRY_PATH)
    throw new InvalidOperationError(
      Operation.Create,
      "package",
      "the name is the one the build generates a library's entry under, so its module would be written over the barrel",
    );
  if (existsSync(join(root, PACKAGES_DIRECTORY, name)))
    throw new InvalidOperationError(Operation.Create, "package", `${name} already has a package`);
};
