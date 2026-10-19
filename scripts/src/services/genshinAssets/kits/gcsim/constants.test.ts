import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";

import { join } from "node:path";
import { describe } from "vitest";

// The text of gcsim at v2.47.2 (MIT, its licence beside it), the oracle the readers' suites assert against
export const GCSIM_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures", "xiangling");

// Odette's Dance Double ticker, an excerpt of the same version
export const GCSIM_ODETTE_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures", "odette");
export const GCSIM_VARKA_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures", "varka");

// Noelle's and Rosaria's bursts, whole files of the same version, each with a queue call of a Mult set's copy of its attack
export const GCSIM_NOELLE_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures", "noelle");
export const GCSIM_ROSARIA_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures", "rosaria");
// Kujou Sara's burst, a whole file of the same version, whose cluster is a loop of repeated calls of a Mult set's copy
export const GCSIM_SARA_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures", "sara");

// A character with no talent variables, for the readers whose suites read no talent table
export const GCSIM_EMPTY_CONFIG: GcsimConfig = { abilityHitboxesMap: new Map(), names: [], talentVariables: [] };

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
