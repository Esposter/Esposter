import { GITHUB_REPOSITORY_URL, PACKAGES_DIRECTORY } from "#src/services/package/new/constants";

// The page npm links a published package to: its own README on the default branch
export const getPackageHomepage = (name: string): string =>
  `${GITHUB_REPOSITORY_URL}/blob/main/${PACKAGES_DIRECTORY}/${name}#readme`;
