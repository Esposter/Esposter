# Tasks

## 1. Tests first

- [ ] 1.1 A watch naming a topic its signed read did not name subscribes nothing. Test `UserObject.test.ts`: "a watch frame naming a topic its signed read did not name subscribes nothing", seen failing while the frame is taken unverified.
- [ ] 1.2 A tampered signature, or one made for another person, is refused. Test `UserObject.test.ts`: "a watch whose signature is tampered is refused, and so is one signed for another person", seen failing first.
- [ ] 1.3 A valid signed watch subscribes its topics with the columns its read names. Test `UserObject.test.ts`: "a signed watch subscribes each of its topics with the columns its read names", seen failing first.
- [ ] 1.4 A watch whose read began past the bound is refused. Test `UserObject.test.ts`: "a watch whose read began past the bound is refused", seen failing first.
- [ ] 1.5 A read taken after a reconnect is watched again, and a reconnect re-watches each stored read as it was signed. Test `connection.test.ts`: "a read taken after a reconnect is watched again" and "subscribes each watched read again from its own time when the socket reconnects", seen failing first.
- [ ] 1.6 A signed-in query's topics are signed for the person who read them, and a signed-out query names none. Test `inferTopicsMiddleware.test.ts`: "a signed-in query's topics are signed for the person who read them" and "a signed-out query names no topics", seen failing first.
- [ ] 1.7 A header's signature reads back with its read. Test `readTopicsHeader.test.ts`: "a read's signature reads back with its topics, and an empty one reads back empty", seen failing first.

## 2. Signing and the header

- [ ] 2.1 Add `getTopicWatchPayload`, `TOPIC_WATCH_MAX_AGE_MS` and the watch frame's signature and `MAX_READ_TOPICS` cap in `@esposter/db-schema`.
- [ ] 2.2 Sign a signed-in query's read in `inferTopicsMiddleware` through `createTopicWatchSignature`, and write the signature into the header entry in `formatTopicsHeaderValue`, reading it back in `readTopicsHeader` and carrying it on `TopicRead`.

## 3. Verification in the user object

- [ ] 3.1 Add `isTopicWatchSigned` and take a watch in `UserObject.webSocketMessage` only when it accepts the frame for the object's person, before any storage write or subscribe.

## 4. The client

- [ ] 4.1 Send each read's frame once per what it adds to the socket, keep each stored read whole with its signature, and re-watch each on reconnect from its own time, in `connection.ts`.
- [ ] 4.2 Register every read in `useWatchTopics`, so a refetch's signature is held, and let go of the read it replaces only after the new one is registered.

## 5. Provisioning

- [ ] 5.1 Declare `TOPIC_WATCH_SECRET` as an optional secret in both environment schemas and both `.env.example` files, and list it under `realtime` and `web` in `.github/worker-secrets.json`. Held by the existing environment tests.
- [ ] 5.2 The owner sets the value in Pulumi ESC for each environment. Not done here: `pulumi env set esposter-infra/prod pulumiConfig.esposter-infra:dev_TOPIC_WATCH_SECRET <value> --secret` and the `prod_` form, as `apps/infra/docs/stacks.md` gives them.

## 6. As-built

- [ ] 6.1 Rewrite the cloudflare-services design's live-state passages as built, and add the verified boundary to the security register.
- [ ] 6.2 Archive this change into `openspec/changes/archive/`.
