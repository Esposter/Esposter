import { BASE_URL } from "@/test/constants";

export default function () {
  process.env.AUTH_ORIGIN = BASE_URL;
  process.env.BASE_URL = BASE_URL;
  process.env.NUXT_AUTH_SECRET = "Secret";
}
