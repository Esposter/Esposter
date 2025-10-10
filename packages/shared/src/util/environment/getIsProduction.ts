import { Environment } from "@/models/environment/Environment";

export const getIsProduction = (): boolean => process.env.NODE_ENV === Environment.production;
