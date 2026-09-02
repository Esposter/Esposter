// What a package is to the rest of the workspace, read off the edges rather than off a list someone maintains.
export enum PackageRole {
  // Nothing in the workspace depends on it, so it is one of the things this repo ships or runs.
  Entrypoint = "entrypoint",
  // It reaches no sibling at runtime, so every other package's shipped code rests on it.
  Foundation = "foundation",
  // Both depended on and depending — the middle of the graph.
  Library = "library",
}
