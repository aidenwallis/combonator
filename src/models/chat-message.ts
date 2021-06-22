import {IRCMessage} from "irc-message-ts";
import {Emote} from "./emotes";

const twitchURL = (id: string) =>
  `https://static-cdn.jtvnw.net/emoticons/v2/${encodeURIComponent(
    id,
  )}/default/dark/3.0`;

export class ChatMessage {
  private emotes: Emote[] = [];
  private content: string[] = [];

  public constructor(msg: IRCMessage) {
    this.content = Array.from(msg.trailing);
    this.parseEmotes((msg?.tags["emotes"] || "").split("/"));
  }

  public getEmotes() {
    return this.emotes;
  }

  private parseEmotes(emotes: string[]) {
    for (const emoteStr of emotes) {
      const [emoteID, placements] = emoteStr.split(":");
      if (!(emoteID && placements)) {
        continue;
      }

      const placementSpl = placements.split(",");
      if (!placementSpl.length) {
        continue;
      }

      const [startStr, endStr] = placementSpl[0].split("-");
      if (!(startStr && endStr)) {
        continue;
      }

      const start = parseInt(startStr);
      const end = parseInt(endStr);
      if (isNaN(start) || isNaN(end)) {
        continue;
      }

      const code = this.content.slice(start, end + 1);
      if (!code) {
        continue;
      }

      this.emotes.push({
        code: code.join(""),
        url: twitchURL(emoteID),
      });
    }
  }

  public parseThirdParty(emotesMap: Map<string, string>) {
    let buffer = "";

    for (let i = 0; i < this.content.length; ++i) {
      const char = this.content[i];
      if (char !== " ") {
        buffer += char;
        continue;
      }
      if (!buffer) {
        continue;
      }

      const emote = emotesMap.get(buffer);
      if (emote) {
        this.emotes.push({code: buffer, url: emote});
      }
      buffer = "";
    }

    const emote = emotesMap.get(buffer);
    if (emote) {
      this.emotes.push({code: buffer, url: emote});
    }

    buffer = "";
  }
}
