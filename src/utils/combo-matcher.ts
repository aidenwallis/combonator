import {Emote} from "../models/emotes";
import {LayoutManager} from "./layout-manager";

export class ComboMatcher {
  private currentEmotes: Set<string> = new Set();
  private currentComboAmount = 0;
  private currentComboEmote: Emote | null = null;
  private layout = new LayoutManager();
  private lastComboTime = 0;

  public constructor(private comboCooldown: number) {}

  public static init(comboCooldown: number) {
    return new ComboMatcher(comboCooldown * 1000);
  }

  public handle(emotes: Emote[]) {
    const prevEmotes = this.currentEmotes;

    const currentEmotes = new Set<string>();
    for (const emote of emotes) {
      currentEmotes.add(emote.code);
    }
    this.currentEmotes = currentEmotes;

    if (this.currentComboEmote) {
      const hasEmote = emotes.find(
        (e) => e.code === this.currentComboEmote?.code,
      );
      if (hasEmote) {
        this.currentComboAmount++;
      } else {
        this.endCombo();
      }
      return;
    }

    for (const emote of emotes) {
      if (prevEmotes.has(emote.code)) {
        // Has a combo!
        this.currentComboAmount = 2;
        this.currentComboEmote = emote;
        return;
      }
    }
  }

  private endCombo() {
    const now = Date.now();
    const delta = now - this.lastComboTime;
    this.lastComboTime = now;

    if (this.comboCooldown === 0 || delta > this.comboCooldown) {
      // Actually fire the fucking event.
      this.layout.handleCombo(
        this.currentComboEmote!,
        this.currentComboAmount,
      );
    }

    this.currentComboAmount = 0;
    this.currentComboEmote = null;
  }
}
