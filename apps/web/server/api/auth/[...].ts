import { auth } from "#server/auth";
import { defineEventHandler } from "nuxt/server";

export default defineEventHandler((event) => auth.handler(event.req));
