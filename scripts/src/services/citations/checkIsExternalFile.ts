import { posix } from "node:path";

// A file a citation names that is not a file of the repository: a `{data-root}` or URL path, a build's or an installed
// Package's `dist` or `node_modules`, or a path no tracked file of the repository has, such as a pinned gcsim's `.go`
// Or a game-data `.json` name. Its lines are pinned by the version or dump it came from, so none of them moves
const EXTERNAL_PATH_REGEX = /^(?:\{|https?:)|(?:^|\/)dist\/|node_modules\//u;

// A citation names a repository file by its path from the root or from the page citing it, so a bare `renovate.json` is
// The root's, a `../` link is a sibling page's, and a bare `burst.go` is the pinned gcsim's, whatever fixtures the
// Repository tracks
export const checkIsExternalFile = (file: string, pagePath: string, repositoryPaths: ReadonlySet<string>): boolean =>
  EXTERNAL_PATH_REGEX.test(file) ||
  ![posix.normalize(file), posix.join(posix.dirname(pagePath), file)].some((path) => repositoryPaths.has(path));
