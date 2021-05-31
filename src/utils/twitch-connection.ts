import {parse as parseIRC} from "irc-message-ts";
import {ChatMessage} from "../models/chat-message";

enum ConnectionState {
  Connected,
  Connecting,
  Disconnected,
}

type MessageCallback = (message: ChatMessage) => void;

const newlineRegex = /[\r\n]+/;

const MAX_RECONNECT_ATTEMPT = 16 * 1000;

export class TwitchConnection {
  public constructor(private login: string) {}

  private conn?: WebSocket;
  private connectionAttempts = 0;
  private forceDisconnect = false;
  private onMessageCallback?: MessageCallback;
  private state = ConnectionState.Disconnected;
  private connectionTimeout?: NodeJS.Timeout;

  public static init(login: string) {
    return new TwitchConnection(login);
  }

  public connect() {
    if (this.forceDisconnect) {
      return;
    }

    if (this.state !== ConnectionState.Disconnected) {
      return;
    }

    this.state = ConnectionState.Connecting;

    this.connectionTimeout = setTimeout(
      () => this.handleDisconnect(),
      5000,
    );
    this.conn = new WebSocket("wss://irc-ws.chat.twitch.tv/");

    this.conn.onopen = () => {
      this.state = ConnectionState.Connected;
      this.connectionAttempts = 0;
      this.connectionTimeout && clearTimeout(this.connectionTimeout);

      this.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      this.send("PASS oauth:1231321321321321");
      this.send("NICK justinfan123");
      this.send("JOIN #" + this.login);
    };

    this.conn.onmessage = (event) => {
      if (!event.data) {
        return;
      }

      const lines = event.data.split(newlineRegex);
      for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        if (!line) {
          continue;
        }
        this.handleLine(line);
      }
    };

    this.conn.onerror = () => this.handleDisconnect();
    this.conn.onclose = () => this.handleDisconnect();
  }

  private send(line: string) {
    if (line.includes("\n")) {
      return;
    }

    if (this.conn?.readyState === WebSocket.OPEN) {
      this.conn.send(line + "\r\n");
    }
  }

  private handleLine(line: string) {
    try {
      const message = parseIRC(line);
      if (!message) {
        return;
      }

      if (message.command === "PRIVMSG") {
        this.onMessageCallback?.(new ChatMessage(message));
      }
    } catch (err) {
      //
    }
  }

  public onMessage(cb: MessageCallback) {
    this.onMessageCallback = cb;
  }

  private handleDisconnect() {
    if (this.state === ConnectionState.Disconnected) {
      return;
    }
    this.state = ConnectionState.Disconnected;

    this.conn?.close?.();

    console.log("Disconnected from Twitch chat.");

    setTimeout(
      () => this.connect(),
      Math.min(this.connectionAttempts * 2000, MAX_RECONNECT_ATTEMPT),
    );
  }
}
