export class DialogMessage {
  text = "";
  title?: string;

  constructor(init?: Partial<DialogMessage>) {
    Object.assign(this, init);
  }
}
