export class URLParams {
  public constructor(private params: Record<string, string>) {}

  public static init(params: string) {
    const resp: Record<string, string> = {};
    const spl = params.split("&");
    for (let i = 0; i < spl.length; ++i) {
      const [key, ...value] = spl[i].split("=");
      if (!key) {
        continue;
      }
      resp[key] = value.join("=");
    }

    return new URLParams(resp);
  }

  public get(key: string) {
    return decodeURIComponent(this.params[key] || "").trim();
  }

  public id() {
    return this.get("twitch_id");
  }

  public login() {
    return this.get("twitch_login");
  }

  public minComboAmount() {
    const comboInt = parseInt(this.get("min_combo_amount") || "4");
    return isNaN(comboInt) ? 4 : comboInt;
  }

  public bannedEmotes() {
    // TODO
    return this.get("banned_emotes").split(",") || [];
  }

  public cooldown() {
    const cooldownInt = parseInt(this.get("combo_cooldown") || "0");
    return isNaN(cooldownInt) ? 0 : cooldownInt;
  }

  public isValid() {
    return this.id() && this.login() && this.minComboAmount();
  }
}
