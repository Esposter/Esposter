import { auth } from "@@/server/auth";

export default defineEventHandler((event) => auth.handler(event.req));
