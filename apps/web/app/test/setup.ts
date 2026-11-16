import { vi } from "vitest";

// The client's twin of `shared/test/setup.ts`, which may not reach the app tree. The browser's better-auth client is
// Registered once, as the server's session is there: its session store outlives the component that asked for it, since
// Nanostores runs the store's cleanup on a timer after the last listener leaves, so a suite that mounts a component
// Reading the session without mocking it lets the real store's cleanup fire after the environment is torn down, where
// `window` no longer has `removeEventListener`
vi.mock(import("#src/services/auth/authClient"), () => import("#src/services/auth/authClient.test"));
