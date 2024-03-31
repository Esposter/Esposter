export class DialogMessage {
  title?: string;
  text = "";

  constructor(init?: Partial<DialogMessage>) {
    Object.assign(this, init);
  }
}
