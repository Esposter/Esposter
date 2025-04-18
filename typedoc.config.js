/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  entryPoints: ["packages/*"],
  name: "Esposter",
  entryPointStrategy: "packages",
  packageOptions: {
    entryPoints: ["src/index.ts"],
    includeVersion: true,
  },
  exclude: ["packages/app", "packages/configuration"],
  out: "packages/app/public/docs",
};

export default typedocConfiguration;
