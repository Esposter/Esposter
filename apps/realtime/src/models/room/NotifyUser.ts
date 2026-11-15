import type { UserObject } from "#src/durableObjects/UserObject";

export type NotifyUser = (user: DurableObjectStub<UserObject>) => Promise<unknown>;
