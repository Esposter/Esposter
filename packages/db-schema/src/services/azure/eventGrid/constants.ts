// The schema version every event this system publishes carries. One value across all publishers, so a consumer
// Reading `dataVersion` is reading a single repo-wide contract rather than one literal per call site; it only moves
// When a `data` payload shape changes incompatibly.
export const EVENT_GRID_DATA_VERSION = "1.0";

// How long Event Grid keeps retrying one event before it gives up on it, and therefore how long after an event
// Was raised a delivery of it can still arrive. Declared here rather than in the infra package because the two
// Sides of it are in different packages: every subscription carries it as its `eventTimeToLiveInMinutes`
// (AzureEventSubscriptionRetryPolicy), and it also bounds a consumer — any row a handler needs in order to apply
// Its event must outlive this window, or the redelivery that finally succeeds finds nothing and the event is
// Silently lost. The storage ledger is the one that obeys it (/docs/platform/storage-quotas). Both readings come
// Off the one duration, in the unit each end actually takes, so neither can drift from the other.
const EVENT_GRID_DELIVERY_TTL = Temporal.Duration.from({ hours: 1 });
export const EVENT_GRID_DELIVERY_TTL_MINUTES: number = EVENT_GRID_DELIVERY_TTL.total("minutes");
export const EVENT_GRID_DELIVERY_TTL_MS: number = EVENT_GRID_DELIVERY_TTL.total("milliseconds");

// Event Grid caps a single event at 1 MB. A blob name is bounded in CHARACTERS, not bytes — a filename is
// Arbitrary user text, so one maximal name of CJK or emoji serialises to several times its length in UTF-8 and a
// Count alone cannot bound an event. Publishers therefore chunk against both: this ceiling on names, and the byte
// Budget below measured on the serialised payload. A publisher with more to delete splits into one event per
// Chunk; each chunk is its own delivery, so a partial publish still makes the chunks that landed durable.
export const MAX_BLOB_DELETION_EVENT_BLOB_NAMES = 500;

// Half of Event Grid's 1 MB event cap, in bytes of serialised `blobNames`. The remaining headroom absorbs the
// Envelope every event carries (id, subject, type, time, the rest of `data`) plus JSON's own quoting and commas,
// None of which the publisher measures. An event that exceeds the real cap is rejected outright, and since the
// Publish is best-effort and post-persist, the rejection is silent and the blobs it named are never reclaimed.
export const MAX_BLOB_DELETION_EVENT_DATA_BYTES = 512 * 2 ** 10;

// Event Grid caps a publish REQUEST at 1 MB, independently of the per-event cap — so a batch of individually legal
// Events is still rejected whole once their sum crosses it. Half that, in bytes of the serialized events, because
// The publisher measures only the events it hands over: the array's own punctuation and the fields the service
// Stamps on each one (topic, eventTime, metadataVersion) are outside what it can see. The replay is what needs
// This — Event Grid writes whatever expired together into one dead-letter blob, so a blob at the event cap
// Republished as a single request exceeds the request cap, and the replay subscription has no dead letter of its
// Own: the rejection burns every attempt on the same oversized batch and the events are discarded for good.
export const MAX_EVENT_GRID_PUBLISH_BYTES = 512 * 2 ** 10;

// The other half of the publish-request cap: Event Grid also bounds a request at 5,000 events, independently of
// Its size, so a batch of small events clears the byte budget above and is still rejected whole. Taken exactly
// Rather than halved like the byte budget, because nothing the service adds is invisible here — the count it
// Enforces is the length of the array the publisher hands over, which the publisher can measure precisely
export const MAX_EVENT_GRID_PUBLISH_EVENT_COUNT = 5000;

// A prefix deletion enumerates its own set, which has no ceiling — a room's whole attachment directory can hold
// Tens of thousands of blobs. One DELETE per blob all at once would exhaust the worker's sockets and throttle the
// Account, and a single rejection fails the whole run, so the deletes go out in bounded waves instead.
export const MAX_CONCURRENT_BLOB_DELETIONS = 100;
