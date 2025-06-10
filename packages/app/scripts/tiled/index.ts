import { createPropertyTypes } from "@@/scripts/tiled/propertyTypes/createPropertyTypes";
import { remove } from "@@/scripts/tiled/util/remove";
import { spawn } from "node:child_process";
/**
 * Order here is important!
 * We must create property types first which include important metadata enums
 * e.g. TilemapKey which must exist before we create other tilemap specific metadata.
 * This causes a small issue if you try to run the create scripts in parallel as the typechecking
 * will complain about the not-yet existent created typescript enum files from createPropertyTypes
 */
await remove();
await createPropertyTypes();
const proc = spawn("bun", ["scripts/tiled/createTmxProperties.ts"], { shell: true, stdio: "inherit" });
proc.on("exit", (code) => process.exit(code));
