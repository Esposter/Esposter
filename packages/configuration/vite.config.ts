import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"]
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
});
