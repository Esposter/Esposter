import { Environment } from "../../../shared/models/environment/Environment";

export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_TEST = import.meta.env.MODE === Environment.test;
export const IS_DEVELOPMENT = import.meta.env.DEV;
