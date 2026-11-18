import type { TopicObjectRpc } from "@esposter/db-schema";

// The calling Worker's binding of the realtime Worker's Topic objects, as much of it as a publish reads. Structural,
// Since each Worker types its bindings from its own copy of the Workers types
export interface TopicNamespace<TId> {
  get: (id: TId) => Pick<TopicObjectRpc, "publish">;
  idFromName: (name: string) => TId;
}
