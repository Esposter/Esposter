// The plugin's node script, run as `node --input-type=module -e` with its request on stdin: the one network call and the
// Evidence log run here, since the hooks module has no Node. It is a string because a plugin reaches none of its own
// Files from inside the module, and it writes exactly one JSON result, so a run that exits otherwise reads as failed
export const SINS_SCRIPT = `
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const { apiUrl, questions, session, state, storePath } = JSON.parse(input);
const finish = (result) => process.stdout.write(JSON.stringify(result));
const key = process.env.TYPESAFE_API_KEY;
const sqlite = process.getBuiltinModule("node:sqlite");

if (!key) finish({ result: "no-key" });
else if (!sqlite) finish({ result: "node-too-old" });
else {
  const response = await fetch(apiUrl, {
    body: JSON.stringify({ model: "jev-latest", questions, state }),
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    method: "POST",
  });
  const answers = response.ok ? (await response.json()).answers || {} : {};
  const names = Object.keys(questions);
  const isAnswered = names.every(
    (name) => typeof answers[name]?.score === "number" && typeof answers[name]?.confidence === "number",
  );
  if (!isAnswered) finish({ reason: response.ok ? "unanswered" : "HTTP " + response.status, result: "failed" });
  else {
    mkdirSync(dirname(storePath), { recursive: true });
    const database = new sqlite.Database(storePath);
    database.exec("PRAGMA busy_timeout = 5000");
    database.exec(
      "CREATE TABLE IF NOT EXISTS evidence (id INTEGER PRIMARY KEY, session INTEGER NOT NULL, answers TEXT NOT NULL, recorded_at INTEGER NOT NULL)",
    );
    const picked = Object.fromEntries(names.map((name) => [name, { confidence: answers[name].confidence, score: answers[name].score }]));
    database.prepare("INSERT INTO evidence (session, answers, recorded_at) VALUES (?, ?, ?)").run(session, JSON.stringify(picked), Date.now());
    database.close();
    finish({ answers: picked, result: "answered" });
  }
}
`;
