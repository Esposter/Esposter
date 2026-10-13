// The chat window: a list of the lines sent and the replies that came back, and a box to type into. Served under the
// Token's own path, so its relative requests reach the same server and nothing else. Plain markup and script, no build
export const createChannelPage = (): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chat into the session</title>
<style>
:root { color-scheme: light dark; --surface: #ffffff; --text: #1d1d1f; --muted: #6e6e73; --line: #d2d2d7; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --surface: #1c1c1e; --text: #f5f5f7; --muted: #98989d; --line: #3a3a3c; } }
:root[data-theme="dark"] { --surface: #1c1c1e; --text: #f5f5f7; --muted: #98989d; --line: #3a3a3c; }
body { margin: 0; padding: 1rem; background: var(--surface); color: var(--text); font: 1rem/1.5 system-ui, sans-serif; }
ol { margin: 0 0 1rem; padding: 0; list-style: none; }
li { margin: 0 0 0.5rem; }
li.sent { color: var(--muted); }
li.reply { color: var(--text); }
form { display: flex; gap: 0.5rem; }
input { flex: 1; min-width: 0; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; }
button { padding: 0.5rem 1rem; border: 1px solid var(--line); border-radius: 0.5rem; background: transparent; color: var(--text); font: inherit; }
</style>
</head>
<body>
<ol id="log" aria-live="polite"></ol>
<form id="form">
<input id="line" autocomplete="off" autofocus aria-label="Message to the session">
<button type="submit">Send</button>
</form>
<script>
const log = document.getElementById("log");
const form = document.getElementById("form");
const input = document.getElementById("line");
const append = (kind, text) => {
  const item = document.createElement("li");
  item.className = kind;
  item.textContent = text;
  log.append(item);
  item.scrollIntoView();
};
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") return;
  input.value = "";
  append("sent", text);
  try {
    await fetch("say", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
  } catch {
    append("sent", "not sent");
  }
});
new EventSource("events").addEventListener("reply", (event) => {
  append("reply", JSON.parse(event.data).text);
});
</script>
</body>
</html>
`;
