import type { LoginButtonProps } from "@/components/Login/Button.vue";

export const LoginButtonItems: LoginButtonProps[] = [
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Google.vue`))),
    logoStyle: {
      backgroundColor: "#fff",
      borderRadius: "4px 0 0 4px",
      height: "3rem",
      padding: ".625rem",
      width: "3rem",
    },
    provider: "google",
    style: { backgroundColor: "#4285f4", paddingLeft: "0" },
  },
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Github.vue`))),
    logoAttrs: { fill: "#fff" },
    provider: "github",
    style: { backgroundColor: "#252525" },
  },
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Facebook.vue`))),
    provider: "facebook",
    style: { backgroundColor: "#1877f2" },
  },
];
