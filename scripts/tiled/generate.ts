import { generatePropertyTypes } from "@/scripts/tiled/generatePropertyTypes";
import { generateLayers } from "@/scripts/tiled/layers/generateLayers";
import { remove } from "@/scripts/tiled/util/remove";

await remove();
// Order here is important!
// We must generate property types first which include important metadata enums
// e.g. TilemapKey which must exist before we generate other tilemap specific metadata
await generatePropertyTypes();
// This causes a small issue when you run the generate scripts below for the first time
// as the typechecking will complain about the not-yet existent
// generated typescript enum files from generatePropertyTypes
// If that's the case, please comment out the below generation scripts and run generatePropertyTypes first
// to bootstrap the required metadata typescript enum files
// We don't comment this out by default for a smoother continuous development workflow
await generateLayers();
