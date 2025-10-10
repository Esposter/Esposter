import { Environment } from "@/models/environment/Environment";

export const getIsProduction = (): boolean => {
  const { NODE_ENV } = process.env;
  return NODE_ENV === Environment.production;
};
