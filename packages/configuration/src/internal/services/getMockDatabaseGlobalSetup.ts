import { readPackageManifest } from "#src/services/readPackageManifest";

const MOCK_DATABASE_GLOBAL_SETUP_SPECIFIER = "@esposter/db-mock/global-setup";
const MOCK_DATABASE_PACKAGE_NAME = MOCK_DATABASE_GLOBAL_SETUP_SPECIFIER.slice(
  0,
  MOCK_DATABASE_GLOBAL_SETUP_SPECIFIER.lastIndexOf("/"),
);

// A project that depends on the mock database builds its migrated template once before its workers start, so no file
// Builds one of its own. Read the dependency from the project's manifest rather than maintaining a consumer roster.
export const getMockDatabaseGlobalSetup = (projectDirectory: string): string[] => {
  const { dependencies, devDependencies, name } = readPackageManifest(projectDirectory);
  const isMockDatabaseConsumer =
    name === MOCK_DATABASE_PACKAGE_NAME ||
    Object.hasOwn({ ...dependencies, ...devDependencies }, MOCK_DATABASE_PACKAGE_NAME);
  return isMockDatabaseConsumer ? [MOCK_DATABASE_GLOBAL_SETUP_SPECIFIER] : [];
};
