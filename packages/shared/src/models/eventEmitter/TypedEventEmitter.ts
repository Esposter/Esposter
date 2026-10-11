import type { EventListenerEntry } from "#src/models/eventEmitter/EventListenerEntry";
import type { EventListenerMap } from "#src/models/eventEmitter/EventListenerMap";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

export class TypedEventEmitter<TEventMap extends EventListenerMap<TEventMap>> {
  readonly #entriesMap = new Map<keyof TEventMap, EventListenerEntry<TEventMap>[]>();

  emit<TEvent extends keyof TEventMap>(event: TEvent, ...args: Parameters<TEventMap[TEvent]>): boolean {
    const entries = this.#entriesMap.get(event) ?? [];
    if (entries.length === 0) return false;

    // The entries are copied out before any listener runs, so a listener removed during the emit still runs
    // For this emit, and one added during it waits for the next
    this.#setEntries(
      event,
      entries.filter((entry) => !entry.isOnce),
    );
    for (const { listener } of entries) listener(...args);
    return true;
  }

  off<TEvent extends keyof TEventMap>(event: TEvent, listener: TEventMap[TEvent]): void {
    this.#setEntries(
      event,
      (this.#entriesMap.get(event) ?? []).filter((entry) => entry.listener !== listener),
    );
  }

  on<TEvent extends keyof TEventMap>(event: TEvent, listener: TEventMap[TEvent]): void {
    this.#addEntry(event, listener, false);
  }

  once<TEvent extends keyof TEventMap>(event: TEvent, listener: TEventMap[TEvent]): void {
    this.#addEntry(event, listener, true);
  }

  // Without an event name every event's listeners are removed, and an empty event name is an event like any other
  removeAllListeners(event?: keyof TEventMap): void {
    if (event === undefined) this.#entriesMap.clear();
    else this.#entriesMap.delete(event);
  }

  #addEntry<TEvent extends keyof TEventMap>(event: TEvent, listener: TEventMap[TEvent], isOnce: boolean) {
    if (typeof listener !== "function")
      throw new InvalidOperationError(Operation.Create, String(event), "The listener must be a function");

    this.#setEntries(event, [...(this.#entriesMap.get(event) ?? []), { isOnce, listener }]);
  }

  #setEntries(event: keyof TEventMap, entries: EventListenerEntry<TEventMap>[]) {
    if (entries.length === 0) this.#entriesMap.delete(event);
    else this.#entriesMap.set(event, entries);
  }
}
