import { TRPCClientError } from "@trpc/client";

export class TRPCOfflineClientError extends TRPCClientError<never> {
  constructor() {
    super("offline");
  }
}
