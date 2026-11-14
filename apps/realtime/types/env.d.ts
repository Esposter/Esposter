import type { CallObject } from "#src/durableObjects/CallObject";
import type { RoomObject } from "#src/durableObjects/RoomObject";
import type { TopicObject } from "#src/durableObjects/TopicObject";
import type { UserObject } from "#src/durableObjects/UserObject";
import type { RealtimeEnvironmentVariables } from "#src/models/environment/RealtimeEnvironmentVariables";

// The bindings wrangler.jsonc declares, typed once here. The objects are this Worker's own, bound under their class's name.
// The queue is the notification job's producer, bound under the name the job's map gives.
declare global {
  namespace Cloudflare {
    interface Env {
      CALL: DurableObjectNamespace<CallObject>;
      CORE: D1Database;
      PROCESS_NOTIFICATION_QUEUE: Queue;
      RESOURCE_ASSETS: R2Bucket;
      ROOM: DurableObjectNamespace<RoomObject>;
      TOPIC: DurableObjectNamespace<TopicObject>;
      USER: DurableObjectNamespace<UserObject>;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends RealtimeEnvironmentVariables {}
  }
}

export {};
