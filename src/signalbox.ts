import { WebContents, ipcMain } from "electron";
import { SBox } from "signalbox-sdk"
import { SignalBox } from "signalbox-sdk/dist/signal-box";
import { SignalGenerator } from "./signal-generator";

const vendorID = '0483';
const productID = '5740';

export class SigBox {
  window: WebContents;
  box: SignalBox | null;
  sGenerator: SignalGenerator | null;

  constructor(window: WebContents) {
    this.window = window;
    this.box = null;
    this.sGenerator = null;
    this.installEventHandlers();
  }

  async connect() : Promise<void> {
    let ports = await SBox.SignalBox.getSerialPorts();
    let port = ports.find(p => (p.vendorId == vendorID) && (p.productId == productID));
    if (port != undefined) {
      this.box = new SignalBox(port.path);
      this.sGenerator = new SignalGenerator(this.box);

      this.box.on("data-read", async (data) => {
        this.window.send("data-read", data);
      });

      await this.box.connect();
      this.window.send("signalbox-connected");
    }
  }

  async startAcquisition() : Promise<void> {
    await this.box!.run();
    this.sGenerator!.run();
  }

  async stopAcquisition() : Promise<void> {
    this.sGenerator!.stop();
    await this.box!.stop();
  }

  installEventHandlers(): void {
    ipcMain.on("signalbox-start-acquisition", () => this.startAcquisition());
    ipcMain.on("signalbox-stop-acquisition", () => this.stopAcquisition());
  }
}
