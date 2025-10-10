import { Environment } from "@/models/environment/Environment";

export const IS_PRODUCTION: boolean = process.env.NODE_ENV === Environment.production;
export const IS_TEST: boolean = process.env.NODE_ENV === Environment.test;
export const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === Environment.development;
