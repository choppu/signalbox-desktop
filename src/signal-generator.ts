import { SignalBox } from "signalbox-sdk/dist/signal-box";

export class SignalGenerator {
  box: SignalBox;
  isRunning: boolean;
  x: number;

  constructor(sB: SignalBox) {
    this.box = sB;
    this.isRunning = false;
    this.x = 0.0;
  }

  run() : void {
    if(!this.isRunning) {
      this.isRunning = true;
      this.generateSignalOutput();
    } 
  }

  stop() : void {
    this.isRunning = false;
  }

  async generateSignalOutput() {
    if(this.isRunning) {
      let data = [];

      for(let i = 0; i < 32; i++) {
        data.push(this.x/8200.0);
        this.x = (this.x + 1) % 8200;
      }

      await this.box.write(data);
      if (this.isRunning) this.generateSignalOutput();
    }
  }
}