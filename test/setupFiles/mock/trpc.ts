import { server } from "@/test/mock/server";
import { afterAll, afterEach, beforeAll } from "vitest";

export default function () {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
