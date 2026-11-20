import { vi } from "vitest";

// A topic's object lives in the realtime Worker, so a published topic is recorded where a test can read it. The binding
// Is written into the db-mock env when the one module reading it loads, so a file that never publishes never loads the
// Schema the mock namespace is built on
vi.mock(import("#src/services/shared/runUnit"), async (importOriginal) => {
  const [{ env }, { mockTopicNamespace }] = await Promise.all([
    import("cloudflare:workers"),
    import("#src/services/realtime/publishTopics.test"),
  ]);
  Object.assign(env, { TOPIC: mockTopicNamespace });
  return importOriginal();
});
