/// <reference types="vite/client" />
import { Environment } from "#shared/models/environment/Environment";

/* oxlint-disable selector-ban/no-restricted-syntax -- this file is where the build mode is read, once, for every
   other file to import */
export const IS_PRODUCTION = import.meta.env.MODE === Environment.Production;
export const IS_DEVELOPMENT = import.meta.env.MODE === Environment.Development;
export const IS_TEST = import.meta.env.MODE === Environment.Test;
// Whether Nuxt itself runs in development, the command's answer rather than the declared environment's: a build strips
// Nuxt's `DevOnly` blocks and leaves out its dev-only routes, whatever `APP_ENV` says, so a gate that must agree with
// What the bundle holds reads this and not `IS_DEVELOPMENT`
export const IS_NUXT_DEVELOPMENT = import.meta.dev;
