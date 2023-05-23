import { marked } from "marked";
// @NOTE
// @ts-ignore
import { gfmHeadingId } from "marked-gfm-heading-id";
// @ts-ignore
import { mangle } from "marked-mangle";

export default defineNuxtPlugin(() => {
  marked.use(gfmHeadingId());
  marked.use(mangle());
});
