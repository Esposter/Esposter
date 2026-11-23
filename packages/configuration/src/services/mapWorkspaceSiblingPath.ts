// A workspace sibling's built output, which a package inlines when the sibling is its devDependency. Unbundled, its
// Modules are named from the folder every module of the bundle shares, which is the machine's home folder once a store
// Module is among them, so the name opens on the checkout's own path. The match keeps the sibling's name and drops that
// Path, and the output is written under `vendor` beside a vendored package's files, so it names no part of the location
const WORKSPACE_SIBLING_OUTPUT_REGEX = /^(?:.*\/)?packages\/(?<package>[^/]+)\/dist\//u;

export const mapWorkspaceSiblingPath = (name: string): string =>
  name.replace(WORKSPACE_SIBLING_OUTPUT_REGEX, "vendor/$<package>/");
