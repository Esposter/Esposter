// The Nuxt components the world renders as globals, which the host app registers and this package cannot import:
// Nuxt exports neither component by path. The host's own generated declarations type them there; these type them in
// This package's program, for the props it passes
import type { DefineComponent, ImgHTMLAttributes } from "vue";

declare module "vue" {
  interface GlobalComponents {
    NuxtImg: DefineComponent<ImgHTMLAttributes>;
    NuxtTime: DefineComponent<
      Intl.DateTimeFormatOptions & {
        datetime: Date | number | string;
        locale?: string;
        relative?: boolean;
        title?: boolean | string;
      }
    >;
  }
}
