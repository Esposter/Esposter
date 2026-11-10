/// <reference types="vite/client" />
import { Environment } from "#shared/models/environment/Environment";

/* eslint-disable no-restricted-syntax -- this file is where the build mode is read, once, for every other file to import */
export const IS_PRODUCTION = import.meta.env.MODE === Environment.Production;
export const IS_DEVELOPMENT = import.meta.env.MODE === Environment.Development;
export const IS_TEST = import.meta.env.MODE === Environment.Test;
