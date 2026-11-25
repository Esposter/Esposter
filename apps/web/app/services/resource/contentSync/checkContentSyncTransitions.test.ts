import type { ContentBase } from "#src/models/resource/contentSync/ContentBase";
import type { ContentSyncEvent } from "#src/models/resource/contentSync/ContentSyncEvent";
import type { ContentSyncState } from "#src/models/resource/contentSync/ContentSyncState";

import { ContentSyncEffectType } from "#src/models/resource/contentSync/ContentSyncEffect";
import { ContentSyncEventType } from "#src/models/resource/contentSync/ContentSyncEvent";
import { ContentSyncKind } from "#src/models/resource/contentSync/ContentSyncKind";
import { reduceContentSync } from "#src/services/resource/contentSync/reduceContentSync";
import { describe, expect, test } from "vitest";

const getVersion = (state: ContentSyncState) =>
  state.kind === ContentSyncKind.Unread ? undefined : state.base.version;

describe("content sync transitions", () => {
  // The invariants checked one transition at a time, over every state kind and every event with each relation its
  // Parameters can bear to the state — older, equal or newer than the base's version, the same or another hash. The
  // Reducer only compares values for equality and versions for order, so these cases are all the cases there are. Each
  // Invariant is inductive: one that holds from every state across every transition holds along every sequence of them,
  // So no interleaving is explored and the check costs states times events
  // (openspec/specs/architecture/content-sync/design.md)
  const base: ContentBase = { hash: "base", json: "base", version: 5 };
  const sent = { content: "sent", json: "sent" };
  const latest = { content: "latest", json: "latest" };
  const remoteVersions = [undefined, 6] as const;

  const states: ContentSyncState[] = [
    { kind: ContentSyncKind.Unread },
    { base, kind: ContentSyncKind.Synced },
    { base, kind: ContentSyncKind.Dirty },
    { base, kind: ContentSyncKind.Failed },
    { base, kind: ContentSyncKind.Adopting, remoteVersion: 6 },
    { base, kind: ContentSyncKind.Conflict, remoteVersion: 6 },
    ...[false, true].flatMap((isEdited) =>
      [false, true].flatMap((isReloading) =>
        [undefined, latest].flatMap((next) =>
          remoteVersions.map((remoteVersion): ContentSyncState => ({
            base,
            isEdited,
            isReloading,
            kind: ContentSyncKind.Saving,
            sent,
            ...(next ? { next } : {}),
            ...(remoteVersion === undefined ? {} : { remoteVersion }),
          })),
        ),
      ),
    ),
  ];
  const versions = [4, 5, 6, 7];
  const hashes = ["base", "sent", "other"];
  const events: ContentSyncEvent[] = [
    { type: ContentSyncEventType.Edited },
    { type: ContentSyncEventType.MineKept },
    { type: ContentSyncEventType.ReloadRequested },
    { type: ContentSyncEventType.SaveRefused },
    { type: ContentSyncEventType.TheirsTaken },
    { isStale: false, type: ContentSyncEventType.SaveRejected },
    { isStale: true, type: ContentSyncEventType.SaveRejected },
    { json: "seeded", type: ContentSyncEventType.Seeded },
    ...["base", "edited"].map((json): ContentSyncEvent => ({
      snapshot: { content: json, json },
      type: ContentSyncEventType.SaveRequested,
    })),
    ...versions.flatMap((version) =>
      hashes.flatMap((hash): ContentSyncEvent[] => [
        { hash, type: ContentSyncEventType.Read, version },
        { hash, type: ContentSyncEventType.RowArrived, version },
        { hash, type: ContentSyncEventType.SaveAcknowledged, version },
      ]),
    ),
  ];

  test("preserve every invariant from every state across every event", () => {
    expect.hasAssertions();

    const violations: string[] = [];
    for (const state of states)
      for (const event of events) {
        const { effects, state: nextState } = reduceContentSync(state, event);
        const name = `${state.kind} + ${JSON.stringify(event)}`;
        const isApplied = effects.some(({ type }) => type === ContentSyncEffectType.ApplyRead);
        const sends = effects.filter(({ type }) => type === ContentSyncEffectType.Send).length;
        const isAnswer =
          event.type === ContentSyncEventType.SaveAcknowledged || event.type === ContentSyncEventType.SaveRejected;
        const before = getVersion(state);
        const after = getVersion(nextState);
        // A save is in flight exactly while the state is Saving, so a send starts one only where none is
        if (sends > 1 || (sends === 1 && state.kind === ContentSyncKind.Saving && !isAnswer))
          violations.push(`${name}: a second save in flight`);
        if (sends === 1 && nextState.kind !== ContentSyncKind.Saving) violations.push(`${name}: a send not tracked`);
        if (state.kind === ContentSyncKind.Saving && nextState.kind !== ContentSyncKind.Saving && !isAnswer)
          violations.push(`${name}: a save in flight forgotten`);
        // Content replaces what is on screen only for an opening with none, or one adopting with no edit since
        if (isApplied && state.kind !== ContentSyncKind.Unread && state.kind !== ContentSyncKind.Adopting)
          violations.push(`${name}: a read applied over the screen`);
        if (event.type === ContentSyncEventType.Edited && (isApplied || nextState.kind === ContentSyncKind.Adopting))
          violations.push(`${name}: an edit left to an adoption`);
        // The version is the clock: it never goes back, and a row at or below it changes nothing
        if (before !== undefined && after !== undefined && after < before)
          violations.push(`${name}: the version went back`);
        if (
          event.type === ContentSyncEventType.RowArrived &&
          before !== undefined &&
          event.version <= before &&
          (effects.length > 0 || JSON.stringify(nextState) !== JSON.stringify(state))
        )
          violations.push(`${name}: a row no newer than the base changed something`);
      }

    expect(violations).toStrictEqual([]);
  });
});
