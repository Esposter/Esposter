import { generatePropertyTypes } from "@@/scripts/tiled/propertyTypes/generatePropertyTypes";
import { remove } from "@@/scripts/tiled/util/remove";
import { spawn } from "node:child_process";
/**
 * Order here is important!
 * We must generate property types first which include important metadata enums
 * e.g. TilemapKey which must exist before we generate other tilemap specific metadata.
 * This causes a small issue if you try to run the generate scripts in parallel as the typechecking
 * will complain about the not-yet existent generated typescript enum files from generatePropertyTypes
 */
await remove();
await generatePropertyTypes();
const proc = spawn("tsx", ["scripts/tiled/generateTmxProperties.ts"], { shell: true, stdio: "inherit" });
proc.on("exit", (code) => process.exit(code));
