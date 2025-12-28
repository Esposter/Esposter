import { Environment } from "../../../shared/models/environment/Environment";

export const IS_PRODUCTION = process.env.APP_ENV === Environment.production;
export const IS_TEST = process.env.APP_ENV === Environment.test;
export const IS_DEVELOPMENT = process.env.APP_ENV === Environment.development;
