import type { authClient } from "@/services/auth/authClient";

export type Session = typeof authClient.$Infer.Session;
