import { Environment } from "@/models/environment/Environment";

export const getIsTest = (): boolean => process.env.NODE_ENV === Environment.test;
