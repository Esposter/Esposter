import { Environment } from "@/models/environment/Environment";

export const getIsDevelopment = (): boolean => {
  const { NODE_ENV } = process.env;
  return NODE_ENV === Environment.development;
};
