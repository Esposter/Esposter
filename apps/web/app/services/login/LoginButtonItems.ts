import type { ButtonProps } from "#src/components/Login/ButtonProps";

export const LoginButtonItems: ButtonProps[] = [
  { logo: markRaw(defineAsyncComponent(() => import("#src/components/Visual/Logo/Google.vue"))), provider: "google" },
  { logo: markRaw(defineAsyncComponent(() => import("#src/components/Visual/Logo/Github.vue"))), provider: "github" },
  {
    logo: markRaw(defineAsyncComponent(() => import("#src/components/Visual/Logo/Facebook.vue"))),
    provider: "facebook",
  },
];
