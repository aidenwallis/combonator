import {ChatMessage} from "./models/chat-message";
import {URLParams} from "./models/url-params";
import {ComboMatcher} from "./utils/combo-matcher";
import {EmoteStore} from "./utils/emote-store";
import {TwitchConnection} from "./utils/twitch-connection";

export class App {
  private connection: TwitchConnection;
  private emoteStore: EmoteStore;
  private matcher: ComboMatcher;
  private params = URLParams.init(
    window.location.search.substring(1),
  );

  public constructor() {
    this.connection = TwitchConnection.init(this.params.login());
    this.emoteStore = EmoteStore.init(this.params.id());
    this.matcher = ComboMatcher.init(this.params.cooldown());

    if (!this.params.isValid()) {
      window.location.href = "/";
      return;
    }
  }

  public init() {
    this.connection.connect();
    this.emoteStore.load();

    this.connection.onMessage((message: ChatMessage) => {
      this.emoteStore.hydrate(message);
      this.matcher.handle(message.getEmotes());
    });
  }
}

new App().init();
