import { marked } from "marked";

export default defineNuxtPlugin(() => {
  marked.use({ mangle: false, headerIds: false });
});
