const { generateExports } = await import("../dist/index.js");

generateExports(process.argv[2]);
