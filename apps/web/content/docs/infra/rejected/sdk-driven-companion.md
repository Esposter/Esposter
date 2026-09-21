---
title: SDK-driven companion
description: A desktop companion — a visual-novel window with a Live2D avatar and a chat of its own — driving its own Claude session through the Agent SDK or a headless run; rejected because it is metered where everything else in the interface is free, and because a session of its own holds none of the work.
---

# SDK-driven companion

The shape every open-source companion takes: a window of its own with an avatar, a chat box and a voice, talking to a model through a provider layer — for Claude, the Agent SDK, an ACP bridge or a headless `claude -p` run behind a text box. The [Claude interface](/docs/infra/claude-interface) survey deferred it on one platform fact: the subscription was not permitted for any of those, so a driver of its own session paid API prices on every turn.

**Why not:** The platform fact moved, and the answer it moved to is still no. In June 2026 a subscription began carrying a monthly credit for the Agent SDK and headless runs, sized by the plan, with turns billed at API rates once it is spent, or stopped. That is a meter, and the rule the whole interface is built on is that nothing costs anything beyond the subscription already paid for the terminal: the persona is an output style, the voice is an engine on this machine, the pick is a birthday, and each stage was taken only where the terminal already exposed the hook for free. A companion whose every turn draws on a budget that runs out mid-month is the first piece of the interface with a bill, and it would be the piece that speaks.

The second reason stands on its own. A session the companion drives is a second session: it holds none of the files, the diff or the conversation the terminal's session holds, so the character in the window would be a chatbot beside the work rather than the voice of it — and the voice of the work is the entire point of a persona in a coding tool. Both halves of what the window would have given are had without it: the face and the voice through the [viewer as the stage](/docs/proposals/infra/viewer-stage), and a line typed at the character through [chat into the session](/docs/proposals/infra/channel-chat), which pushes it into the terminal's own session rather than opening another.
