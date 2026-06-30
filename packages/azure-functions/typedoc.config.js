import { config } from "dotenv";

config({ path: "packages/app/.env" });
/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  intentionallyNotExported: ["NodeJS.ProcessEnv"],
};

export default typedocConfiguration;
