import type { ButtonProps } from "@/components/Login/ButtonProps";

export const LoginButtonItems: ButtonProps[] = [
  {
    logo: markRaw(defineAsyncComponent(() => import("@/components/Visual/Logo/Google.vue"))),
    provider: "google",
  },
  {
    logo: markRaw(defineAsyncComponent(() => import("@/components/Visual/Logo/Github.vue"))),
    provider: "github",
  },
  {
    logo: markRaw(defineAsyncComponent(() => import("@/components/Visual/Logo/Facebook.vue"))),
    provider: "facebook",
  },
];
