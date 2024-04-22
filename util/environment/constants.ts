import { env } from "@/env.shared";
import { Environment } from "@/models/shared/Environment";

export const IS_PRODUCTION = env.NODE_ENV === Environment.production;
export const IS_TEST = env.NODE_ENV === Environment.test;
export const IS_DEVELOPMENT = env.NODE_ENV === Environment.development;
