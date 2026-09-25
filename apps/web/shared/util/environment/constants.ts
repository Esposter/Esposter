/* eslint-disable no-restricted-syntax -- this file is where the build mode is read, once, for every other file to import */
import { Environment } from "#shared/models/environment/Environment";

export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_TEST = import.meta.env.MODE === Environment.Test;
export const IS_DEVELOPMENT = import.meta.env.DEV;
