// The Nuxt environment preset. resolvePrepareStep detects the nuxt package by its config file, then regenerates the
// Framework's `.nuxt` type surface for the sandbox's own platform. Grouped here so the preset and its test share one
// Source of truth for the prepare command and the output directory.
export const NUXT_OUTPUT_DIRECTORY = ".nuxt";
export const NUXT_PREPARE_COMMAND = "nuxt prepare";
