import { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export default defineNuxtPlugin(() => {
  extend(relativeTime);
});
