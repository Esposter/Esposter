import type { UserConfig } from "vite";

const vitestConfiguration: UserConfig = {
  resolve: {
    tsconfigPaths: true,
  },
};

export default vitestConfiguration;
