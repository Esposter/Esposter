// The Workers runtime has no Temporal yet, and modules read it as they load, so the polyfill installs it before any other import
import "temporal-polyfill/global";

// The realtime objects, one per room, call, person and live-query topic. The web Worker reaches each through its binding, and so does the jobs Worker.
// Deploying this Worker restarts them, so this Worker changes only when they do (openspec/changes/infra-cloudflare-realtime/design.md)
export { CallObject } from "#src/durableObjects/CallObject";
export { RoomObject } from "#src/durableObjects/RoomObject";
export { TopicObject } from "#src/durableObjects/TopicObject";
export { UserObject } from "#src/durableObjects/UserObject";

// This Worker serves no HTTP: every request reaches an object through its binding, not through this Worker's fetch
export default { fetch: () => new Response(null, { status: 404 }) } satisfies ExportedHandler<Cloudflare.Env>;
