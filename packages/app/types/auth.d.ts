import "@auth/core/types";

declare module "@auth/core/types" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}
