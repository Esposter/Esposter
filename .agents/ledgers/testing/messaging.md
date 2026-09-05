# Messaging

Esbabbler — the room, its message list, and everything only they read. The server half belongs to
[server](server.md).

| Unit                                                                                         | Swept      | Notes                             |
| -------------------------------------------------------------------------------------------- | ---------- | --------------------------------- |
| `store/message`                                                                              | 2026-09-05 | the widest keyed state in the app |
| `services/message`                                                                           | —          |                                   |
| `composables/message`                                                                        | —          |                                   |
| `components/Message`                                                                         | —          | splits at `Model/` on contact     |
| `services/{room,user}`, `composables/user`, `store/user`, `components/{User,RichTextEditor}` | —          |                                   |
