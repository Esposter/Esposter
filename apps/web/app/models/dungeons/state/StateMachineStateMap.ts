import type { State } from "@/models/dungeons/state/State";

// Keyed by state name, and each entry typed by its own key, so a state filed under a name other than the one it
// Declares does not compile — the machine compares names to decide whether a transition is a no-op
export type StateMachineStateMap<TStateName extends string> = { [P in TStateName]: State<P> };
