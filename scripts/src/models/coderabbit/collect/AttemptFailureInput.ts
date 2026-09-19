export interface AttemptFailureInput {
  // How many attempts had already failed when this one started — the comment numbers the one it records
  attempts: number;
  // What the session did wrong, when the tree says more than "it failed": the sentence follows "the session"
  detail?: string;
  marker: string;
  // The work, as an infinitive without its subject: "drain review 12", "repair this red `main` head"
  task: string;
}
