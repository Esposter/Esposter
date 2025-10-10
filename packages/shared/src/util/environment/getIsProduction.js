import { Environment } from "../../models/environment/Environment.js";

export const getIsProduction = () => process.env.NODE_ENV === Environment.production;
