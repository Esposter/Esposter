import { Environment } from "@/models/shared/Environment";

export const isProduction = process.env.NODE_ENV === Environment.production;
export const isTest = process.env.NODE_ENV === Environment.test;
export const isDevelopment = process.env.NODE_ENV === Environment.development;
