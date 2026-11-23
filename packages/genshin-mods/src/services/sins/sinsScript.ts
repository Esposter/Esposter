import { SinStatusKind } from "../../models/SinStatusKind";

// The plugin's node script, run as `node --input-type=module -e` with its request on stdin: the one network call and
// The Evidence log run here, since the hooks module has no Node. It is a string because a plugin reaches none of its
// Own Files from inside the module, and it writes exactly one JSON result, so a run that exits otherwise reads as
// Failed
// `isolatedDeclarations` asks for the type of an exported template that
// oxlint-disable-next-line typescript/no-inferrable-types -- interpolates, and this rule would refuse that annotation
export const SINS_SCRIPT: string = `
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

let input = "";
for await (const chunk of process.stdin) input += chunk;
const { apiUrl, key, maxBytes, questions, session, state, storePath } = JSON.parse(input);
const finish = (result) => process.stdout.write(JSON.stringify(result));
const sqlite = process.getBuiltinModule?.("node:sqlite");
// The reply read as JSON, held whole only up to maxBytes: a reply past it is cut off and reads as no answer. The plugin
// reaches no shared reader, so this is its own counting read, of the shape readBoundedBody (genshin-persona) has
const readAnswers = async (response) => {
  const reader = response.body?.getReader();
  if (!reader) return undefined;
  const chunks = [];
  let size = 0;
  for (let read = await reader.read(); !read.done; read = await reader.read()) {
    size += read.value.length;
    if (size > maxBytes) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(read.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

if (!key) finish({ result: "${SinStatusKind.NoKey}" });
else if (!sqlite) finish({ result: "${SinStatusKind.NodeTooOld}" });
else {
  const response = await fetch(apiUrl, {
    body: JSON.stringify({ model: "jev-latest", questions, state }),
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    method: "POST",
  });
  const answers = response.ok ? (await readAnswers(response))?.answers || {} : {};
  const names = Object.keys(questions);
  const isAnswered = names.every(
    (name) => typeof answers[name]?.score === "number" && typeof answers[name]?.confidence === "number",
  );
  if (!isAnswered) finish({ reason: response.ok ? "unanswered" : "HTTP " + response.status, result: "${SinStatusKind.Failed}" });
  else {
    mkdirSync(dirname(storePath), { recursive: true });
    const database = new sqlite.DatabaseSync(storePath);
    try {
      database.exec("PRAGMA busy_timeout = 5000");
      database.exec(
        "CREATE TABLE IF NOT EXISTS evidence (id INTEGER PRIMARY KEY, session INTEGER NOT NULL, answers TEXT NOT NULL, recorded_at INTEGER NOT NULL)",
      );
      const picked = Object.fromEntries(names.map((name) => [name, { confidence: answers[name].confidence, score: answers[name].score }]));
      database.prepare("INSERT INTO evidence (session, answers, recorded_at) VALUES (?, ?, ?)").run(session, JSON.stringify(picked), Date.now());
      finish({ answers: picked, result: "${SinStatusKind.Answered}" });
    } finally {
      database.close();
    }
  }
}
`;
