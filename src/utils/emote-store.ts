import {ChatMessage} from "../models/chat-message";
import {
  BetterttvGlobalBody,
  BetterttvUserBody,
  FrankerfacezGlobalBody,
  FrankerfacezUserBody,
} from "../models/emotes";
import {ApiClient} from "./api-client";
import {RequestError} from "./request-error";

const bttvCdn = (id: string) =>
  `https://cdn.betterttv.net/emote/${encodeURIComponent(id)}/3x`;

export class EmoteStore {
  private api = new ApiClient();
  private emotesMap = new Map<string, string>();

  public constructor(private twitchId: string) {}

  public static init(twitchId: string) {
    return new EmoteStore(twitchId);
  }

  public hydrate(msg: ChatMessage) {
    msg.parseThirdParty(this.emotesMap);
  }

  public load() {
    this.getGlobalBetterTTV();
    this.getGlobalFFZ();
    this.getBetterTTVUser();
    this.getUserFFZ();
  }

  private getGlobalBetterTTV() {
    this.api
      .get<BetterttvGlobalBody>(
        "https://api.betterttv.net/3/cached/emotes/global",
      )
      .then((resp) => {
        for (const emote of resp?.body || []) {
          this.emotesMap.set(emote.code, bttvCdn(emote.id));
        }
      })
      .catch((err) => {
        console.error("Failed to load BeterTTV global emotes.", err);
        setTimeout(() => this.getGlobalBetterTTV(), 30 * 1000);
      });
  }

  private getGlobalFFZ() {
    this.api
      .get<FrankerfacezGlobalBody>(
        "https://api.frankerfacez.com/v1/set/global",
      )
      .then((resp) => {
        for (const setID of resp?.body?.default_sets || []) {
          const set = resp?.body?.sets[setID.toString()];
          if (!set) {
            continue;
          }

          for (const emote of set?.emoticons || []) {
            const url =
              emote?.urls[
                Math.max(
                  ...Object.keys(emote?.urls)
                    .map((e) => parseInt(e))
                    .filter((e) => !isNaN(e)),
                )
              ];
            if (url) {
              this.emotesMap.set(emote.name, url);
            }
          }
        }
      })
      .catch((err) => {
        console.error(
          "Failed to load FrankerFaceZ global emotes.",
          err,
        );
        setTimeout(() => this.getGlobalBetterTTV(), 30 * 1000);
      });
  }

  private getBetterTTVUser() {
    this.api
      .get<BetterttvUserBody>(
        "https://api.betterttv.net/3/cached/users/twitch/" +
          encodeURIComponent(this.twitchId),
      )
      .then((resp) => {
        for (const emote of resp?.body?.channelEmotes || []) {
          this.emotesMap.set(emote.code, bttvCdn(emote.id));
        }
        for (const emote of resp?.body?.sharedEmotes || []) {
          this.emotesMap.set(emote.code, bttvCdn(emote.id));
        }
      })
      .catch((err) => {
        console.error("Failed to load BetterTTV user emotes.", err);
        setTimeout(() => this.getBetterTTVUser(), 30 * 1000);
      });
  }

  private getUserFFZ() {
    this.api
      .get<FrankerfacezUserBody>(
        "https://api.frankerfacez.com/v1/room/id/" +
          encodeURIComponent(this.twitchId),
      )
      .then((resp) => {
        const setID = resp?.body?.room?.set?.toString();
        if (!setID) {
          return;
        }

        const set = resp?.body?.sets[setID];
        if (!set) {
          return;
        }

        for (const emote of set?.emoticons || []) {
          const url =
            emote?.urls[
              Math.max(
                ...Object.keys(emote?.urls)
                  .map((e) => parseInt(e))
                  .filter((e) => !isNaN(e)),
              )
            ];
          if (!url) {
            continue;
          }
          this.emotesMap.set(emote.name, url);
        }
      })
      .catch((err) => {
        if (err instanceof RequestError && err.statusCode === 404) {
          return;
        }
        console.error("Failed to load FFZ user emotes.", err);
        setTimeout(() => this.getUserFFZ(), 30 * 1000);
      });
  }
}
