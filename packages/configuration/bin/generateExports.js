#!/usr/bin/env node
// The package's own source rather than `../dist/index.js`: this bin is what every `export:gen` runs, and a
// Fresh clone has no `dist` until something builds it — which is the barrel this would have generated.
const { generateExports } = await import("#src/generateExports");

generateExports(process.argv[2]);
