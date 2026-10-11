import type { H3Event } from "nitro/h3";

// What the request's response is built from once the page has rendered: its nonce.
// It also holds the hashes the prerender collected for its scripts and styles.
export interface SecurityState {
  hashes: { script: string[]; style: string[] };
  nonce?: string;
}

const securityStateByEvent = new WeakMap<H3Event, SecurityState>();

// The event's state, created empty the first time anything reads it
export const getSecurityState = (event: H3Event): SecurityState => {
  const cachedState = securityStateByEvent.get(event);
  if (cachedState) return cachedState;

  const state: SecurityState = { hashes: { script: [], style: [] } };
  securityStateByEvent.set(event, state);
  return state;
};
