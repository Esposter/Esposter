import { Environment } from "@/models/environment/Environment";

export const getIsTest = (): boolean => {
  const { NODE_ENV } = process.env;
  return NODE_ENV === Environment.test;
};
