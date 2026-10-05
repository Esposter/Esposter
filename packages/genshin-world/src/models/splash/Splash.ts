import type { SplashTiming } from "#src/models/splash/SplashTiming";
import type { Component } from "vue";

// One splash of the opening: the screen it shows, the props it is shown with, and how it comes and goes
export interface Splash {
  component: Component;
  props?: Record<string, unknown>;
  timing: SplashTiming;
}
