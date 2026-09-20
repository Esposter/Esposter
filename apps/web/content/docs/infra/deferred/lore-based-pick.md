---
title: Lore-based pick
description: Picking the session's Genshin character by lore, calendar events and the person's own context rather than the nearest birthday alone, behind an opt-in typed-decision key.
---

# Lore-based pick

The persona plugin picks the character whose birthday is nearest to today. A richer pick would weigh what else the date means in the game — a festival that belongs to one region, a character's story or release anniversary, the patch that is live — and what is known of the person: their time zone, their locale, the hour they start. Classifying a date and a person against lore is the judgement a model does better than a lookup.

**The shape it would take.** The same gate the spoken reply already uses: a plugin option that is a credential, and a feature that exists only while the option is set. A fourth option holds a [typed-decision](/docs/infra/typed-decisions) key. With it set, the session-start hook asks the tier once per date — the roster is the fixed answer set, the date and whatever context the person opted into are the inputs — and records the answer in the state directory beside the pick records, so every later session that day reads it as today's pick and the birthday tie-break is never reached. Without it, the hook is what it is now. Nothing else in the plugin can tell the two apart: the status line, the spinner and the card all read the record. The gate itself stays an `if` at each site — the speech key and the pick key share the manifest's option shape and the environment variable prefix, not a helper, because a wrapper around a condition is a wrapper around syntax.

**Why deferred:** the [persona plugin](/docs/infra/claude-interface/persona-plugin) settled that a session start makes no network call, and the key moves the call from every start to the first start of a day rather than removing it: the first session of a day would wait on a round trip before its greeting. Context about the person beyond the machine's clock — a location, an address — is data the plugin has never read, and sending it to a third party is a line the manifest would have to declare and the person accept; the time zone and the locale are the whole of what the hook can know without asking. The tier's fixed set is meant for a handful of labels, and a roster past a hundred names is a different question until it is shown to hold. And the plugin carries one dependency by design; the SDK would be the second.

**Cheaper interim:** the judgement moves to authoring time. A calendar file in the card syntax — a date range, the region or the characters it favours — is authored once, with a model's help if wanted, and the pick reads it as a second weight beside the birthday distance. That keeps the session-start path as code and puts the lore where the cards already are.

**Revisit when:** the birthday pick feels wrong often enough to notice — a festival week showing the wrong region, an anniversary missed — or the tier answers a roster-sized set in one call and the once-a-day wait is judged worth the pick.
