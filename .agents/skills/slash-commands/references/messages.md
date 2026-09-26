# Message Format

Read when a command posts a message.

Messages use markdown. Rich text applies: italic `*text*`, bold `**text**`, code `` `text` ``.

A `case` that posts assigns the markdown `message` and nothing else — one that opens a dialog or runs a mutation leaves it empty. `marked.parse()` and `sendMessage` are applied **once**, after the switch — never per-case:

```ts
if (message)
  await sendMessage({
    message: marked.parse(message, { async: false }),
    replyRowKey: replyRowKey.value,
    roomId,
    type: MessageType.Message,
  });
```

Never call `sanitizeHtml`/`sanitizeTextHtml` here. Sanitization is declared at the Zod boundary in the base db-schema schemas — see the `string-utils` skill, which bans manual frontend calls.

## `/me` — no new `MessageType`

`/me [message]` does NOT introduce `MessageType.Me`. Wrap the argument in `*...*` and post as a regular `MessageType.Message`:

```ts
case SlashCommandType.Me:
  message = `*${command.parameterValues.message}*`;
  break;
```
