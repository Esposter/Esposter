import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { SNAPSHOT_FILENAME } from "../src/constants";
// Rolldown bundles JS only, so the data dir snapshot is copied into dist alongside index.js post-build.
const source = fileURLToPath(new URL(`../src/${SNAPSHOT_FILENAME}`, import.meta.url));
const destination = fileURLToPath(new URL(`../dist/${SNAPSHOT_FILENAME}`, import.meta.url));
await copyFile(source, destination);
