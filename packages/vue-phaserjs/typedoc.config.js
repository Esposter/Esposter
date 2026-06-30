import { config } from "dotenv";

config({ path: "packages/app/.env" });
/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  externalSymbolLinkMappings: {
    phaser: {
      "Phaser.GameObjects.Components.Depth.depth": "#",
    },
  },
};

export default typedocConfiguration;
