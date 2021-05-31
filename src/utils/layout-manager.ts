import {Emote} from "../models/emotes";
import {Controller} from "./controller";

export class LayoutManager {
  private controller = new Controller();
  private timeout: NodeJS.Timeout | null = null;

  public handleCombo(emote: Emote, amount: number) {
    this.controller.setEmote(amount, emote.url);

    if (this.timeout) {
      this.controller.pulse();
    } else {
      this.controller.enter();
    }

    this.setTimeout();
  }

  private setTimeout() {
    this.timeout && clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.close(), 5000);
  }

  private close() {
    this.controller.exit();
    this.timeout = null;
  }
}
