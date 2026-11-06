// A file a citation names that is not a file of the repository: a `{data-root}` or URL path, a build's or an installed
// Package's `dist`, a source the repository does not track (a `.go` or `.cs` file, a dump's `.tsv`), or a bare
// Game-data `.json` name. Its lines are pinned by the version or dump it came from, so none of them moves
const REPOSITORY_FILE_REGEX = /\.(?:[cm]?[jt]sx?|vue|css|json|md|ya?ml|svg|html|sh|ps1|toml|txt|snap|lock)$/u;
const EXTERNAL_PATH_REGEX = /^(?:\{|https?:|dist\/)|node_modules\//u;

export const checkIsExternalFile = (file: string): boolean =>
  !REPOSITORY_FILE_REGEX.test(file) ||
  EXTERNAL_PATH_REGEX.test(file) ||
  (!file.includes("/") && file.endsWith(".json"));
