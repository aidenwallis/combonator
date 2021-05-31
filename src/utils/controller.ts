const animationClasses = [
  "combo--enter",
  "combo--pulse",
  "combo--exit",
  "combo--none",
];

export class Controller {
  private appNode = document.getElementById("app")!;
  private amountNode = document.getElementById("combo-amount")!;
  private imageNode = document.getElementById(
    "combo-image",
  )! as HTMLImageElement;

  public enter() {
    this.resetAnimationClasses();
    this.appNode.classList.add("combo--enter");
  }

  public pulse() {
    this.appNode.classList.remove("combo--pulse");
    this.appNode.classList.add("combo--pulse");
  }

  public exit() {
    this.resetAnimationClasses();
    this.appNode.classList.add("combo--exit");
  }

  public setEmote(combo: number, image: string) {
    this.amountNode.textContent = combo.toString();
    this.imageNode.src = image;
  }

  private resetAnimationClasses() {
    for (const className of animationClasses) {
      this.appNode?.classList.remove(className);
    }
  }
}
