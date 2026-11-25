import type { ContentBase } from "#src/models/resource/contentSync/ContentBase";
import type { ContentSnapshot } from "#src/models/resource/contentSync/ContentSnapshot";
import type { ContentSyncEffect } from "#src/models/resource/contentSync/ContentSyncEffect";
import type { ContentSyncEvent } from "#src/models/resource/contentSync/ContentSyncEvent";
import type { ContentSyncState, SavingContentSync } from "#src/models/resource/contentSync/ContentSyncState";

import { ContentSyncEffectType } from "#src/models/resource/contentSync/ContentSyncEffect";
import { ContentSyncEventType } from "#src/models/resource/contentSync/ContentSyncEvent";
import { ContentSyncKind } from "#src/models/resource/contentSync/ContentSyncKind";
import { exhaustiveGuard } from "@esposter/shared";

export interface ContentSyncTransition {
  effects: ContentSyncEffect[];
  state: ContentSyncState;
}

const stay = (state: ContentSyncState): ContentSyncTransition => ({ effects: [], state });
const readContent = (base: ContentBase, remoteVersion: number): ContentSyncTransition => ({
  effects: [{ type: ContentSyncEffectType.ReadContent }],
  state: { base, kind: ContentSyncKind.Adopting, remoteVersion },
});
// A save of content the server already holds writes nothing, so the content is Synced rather than sent again
const send = (base: ContentBase, snapshot: ContentSnapshot, isEdited = false): ContentSyncTransition =>
  snapshot.json === base.json
    ? { effects: [], state: { base, kind: isEdited ? ContentSyncKind.Dirty : ContentSyncKind.Synced } }
    : {
        effects: [{ snapshot, type: ContentSyncEffectType.Send, version: base.version }],
        state: { base, isEdited, isReloading: false, kind: ContentSyncKind.Saving, sent: snapshot },
      };
// A save's answer moves the base to what it stored. A newer row seen meanwhile is then another writer's: adopted when
// Nothing was edited since, a conflict otherwise. Without one, the latest save asked for goes next
const acknowledge = (state: SavingContentSync, version: number, hash: string): ContentSyncTransition => {
  // A compare-and-set answers one past the base, so the clamp only keeps the clock from going back on a broken answer
  const base: ContentBase = { hash, json: state.sent.json, version: Math.max(version, state.base.version) };
  const isEdited = state.isEdited || state.next !== undefined;
  if (state.isReloading) return answerReload(state, base);
  else if (state.remoteVersion !== undefined && state.remoteVersion > version)
    return isEdited
      ? stay({ base, kind: ContentSyncKind.Conflict, remoteVersion: state.remoteVersion })
      : readContent(base, state.remoteVersion);
  else if (state.next) return send(base, state.next, state.isEdited);
  else return stay({ base, kind: state.isEdited ? ContentSyncKind.Dirty : ContentSyncKind.Synced });
};
// The restore asked for during the save goes ahead once the save answers, unless the person edited after asking
const answerReload = (state: SavingContentSync, base: ContentBase): ContentSyncTransition =>
  state.isEdited
    ? stay({
        base,
        kind: ContentSyncKind.Conflict,
        remoteVersion: Math.max(state.remoteVersion ?? 0, base.version + 1),
      })
    : readContent(base, base.version);
// A row is another writer's only when its version is newer than the base: a late row of this opening's own earlier
// Save is at or below it. A newer version naming the same content only moves the base on
const arriveRow = (
  state: Exclude<ContentSyncState, { kind: typeof ContentSyncKind.Unread }>,
  version: number,
  hash: string,
): ContentSyncTransition => {
  const { base } = state;
  if (version <= base.version) return stay(state);
  else if (hash === base.hash) return stay({ ...state, base: { ...base, version } });

  switch (state.kind) {
    case ContentSyncKind.Synced:
      return readContent(base, version);
    case ContentSyncKind.Dirty:
    case ContentSyncKind.Failed:
      return stay({ base, kind: ContentSyncKind.Conflict, remoteVersion: version });
    case ContentSyncKind.Adopting:
      return stay({ ...state, remoteVersion: Math.max(state.remoteVersion, version) });
    case ContentSyncKind.Conflict:
    case ContentSyncKind.Saving:
      return stay({ ...state, remoteVersion: Math.max(state.remoteVersion ?? version, version) });
    default:
      return exhaustiveGuard(state);
  }
};
// A read is taken only by an opening that has none yet or is adopting: an adoption an edit interrupted has become a
// Conflict, so the content the read brings is not applied over that edit
const read = (state: ContentSyncState, version: number, hash: string): ContentSyncTransition => {
  const base: ContentBase = { hash, json: "", version };
  if (state.kind === ContentSyncKind.Unread)
    return { effects: [{ type: ContentSyncEffectType.ApplyRead }], state: { base, kind: ContentSyncKind.Synced } };
  else if (state.kind !== ContentSyncKind.Adopting) return stay(state);
  // A read answered before the opening's own save landed is older than the base, so it is read again: a fresh read is
  // Never older than a version the server confirmed
  else if (version < state.base.version) return { effects: [{ type: ContentSyncEffectType.ReadContent }], state };
  // The read is the newest content there is when it lands, so it settles the adoption; content that moved on since
  // Brings its own row, which adopts again
  else return { effects: [{ type: ContentSyncEffectType.ApplyRead }], state: { base, kind: ContentSyncKind.Synced } };
};

// The one statement of how an opening's content moves between the screen and the server. Pure: it returns the next
// State and the effects the driver runs, so every interleaving of edits, answers and other writers' rows is checked
// Against it without a network (openspec/specs/architecture/content-sync/design.md)
export const reduceContentSync = (state: ContentSyncState, event: ContentSyncEvent): ContentSyncTransition => {
  if (event.type === ContentSyncEventType.Read) return read(state, event.version, event.hash);
  else if (state.kind === ContentSyncKind.Unread) return stay(state);

  switch (event.type) {
    case ContentSyncEventType.Edited:
      if (state.kind === ContentSyncKind.Saving) return stay({ ...state, isEdited: true });
      else if (state.kind === ContentSyncKind.Adopting)
        return stay({ base: state.base, kind: ContentSyncKind.Conflict, remoteVersion: state.remoteVersion });
      else if (state.kind === ContentSyncKind.Conflict) return stay(state);
      else return stay({ base: state.base, kind: ContentSyncKind.Dirty });
    case ContentSyncEventType.MineKept:
      // The local content is written as the newest version over the other writer's, which stays in history
      return state.kind === ContentSyncKind.Conflict
        ? {
            effects: [{ type: ContentSyncEffectType.RequestSave }],
            state: { base: { hash: "", json: "", version: state.remoteVersion }, kind: ContentSyncKind.Dirty },
          }
        : stay(state);
    case ContentSyncEventType.ReloadRequested:
      // A restore during a save waits for its answer, so the save in flight is never forgotten beside a second one. The
      // Edits held for it are the ones the restore replaces
      if (state.kind === ContentSyncKind.Saving) {
        const { next: _next, ...saving } = state;
        return stay({ ...saving, isEdited: false, isReloading: true });
      }
      return readContent(state.base, state.base.version);
    case ContentSyncEventType.RowArrived:
      return arriveRow(state, event.version, event.hash);
    case ContentSyncEventType.SaveAcknowledged:
      // An answer the opening no longer waits on — a restore took over while it was in flight — still moves the clock
      return state.kind === ContentSyncKind.Saving
        ? acknowledge(state, event.version, event.hash)
        : stay(
            event.version > state.base.version ? { ...state, base: { ...state.base, version: event.version } } : state,
          );
    case ContentSyncEventType.SaveRefused:
      return state.kind === ContentSyncKind.Dirty || state.kind === ContentSyncKind.Synced
        ? stay({ base: state.base, kind: ContentSyncKind.Failed })
        : stay(state);
    case ContentSyncEventType.SaveRejected:
      if (state.kind !== ContentSyncKind.Saving) return stay(state);
      else if (state.isReloading) return answerReload(state, state.base);
      // Another writer moved the version on, so the person chooses once the row names it
      else if (event.isStale)
        return {
          effects: [{ type: ContentSyncEffectType.ReadRow }],
          state: {
            base: state.base,
            kind: ContentSyncKind.Conflict,
            remoteVersion: Math.max(state.remoteVersion ?? 0, state.base.version + 1),
          },
        };
      // The latest content is tried once more when a save was asked for after the failed one; otherwise the edit
      // Stays on screen as Failed until the next edit asks again
      else if (state.next) return send(state.base, state.next, state.isEdited);
      else return stay({ base: state.base, kind: ContentSyncKind.Failed });
    case ContentSyncEventType.SaveRequested:
      if (state.kind === ContentSyncKind.Saving) return stay({ ...state, isEdited: false, next: event.snapshot });
      else if (state.kind === ContentSyncKind.Adopting || state.kind === ContentSyncKind.Conflict) return stay(state);
      else return send(state.base, event.snapshot);
    case ContentSyncEventType.Seeded:
      return stay({ ...state, base: { ...state.base, json: event.json } });
    case ContentSyncEventType.TheirsTaken:
      return state.kind === ContentSyncKind.Conflict ? readContent(state.base, state.remoteVersion) : stay(state);
    default:
      return exhaustiveGuard(event);
  }
};
