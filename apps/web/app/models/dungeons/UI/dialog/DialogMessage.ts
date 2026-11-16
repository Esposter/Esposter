export class DialogMessage {
  text = "";
  title?: string | undefined;

  constructor(init?: Partial<DialogMessage>) {
    Object.assign(this, init);
  }
}
