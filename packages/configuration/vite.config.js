import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"]
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
  plugins: [vue(), dts(), mkcert()],
  resolve: {
    alias: {
      '@': "./src",
    }
  }
});
