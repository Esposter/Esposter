// Resolved by package specifier rather than by relative path: this is the one consumer of the augmentation that
// Sits outside `packages/`, so nothing but the package's own `exports` map can name it without counting
// Directories — which is what silently broke when the app moved and took every `Object.entries` key type with it
import "@esposter/configuration/types/global.d.ts";
