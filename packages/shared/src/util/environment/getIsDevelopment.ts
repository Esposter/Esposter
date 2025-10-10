import { Environment } from "@/models/environment/Environment";

export const getIsDevelopment = (): boolean => process.env.NODE_ENV === Environment.development;
