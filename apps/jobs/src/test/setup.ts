import { mockTopicNamespace } from "#src/services/realtime/publishTopics.test";
import { env } from "cloudflare:workers";

// A topic's object lives in the realtime Worker, so a published topic is recorded where a test can read it. The binding
// Is written into the db-mock env that the Worker's modules read through
Object.assign(env, { TOPIC: mockTopicNamespace });
