import { WebContents, ipcMain } from "electron";
import { SBox } from "signalbox-sdk"
import { SignalBox } from "signalbox-sdk/dist/signal-box";

const vendorID = '0483';
const productID = '5740';

export class SigBox {
  window: WebContents;
  box!: SignalBox | null;

  constructor(window: WebContents) {
    this.window = window;
    this.box = null;
    this.installEventHandlers();
  }

  async connect() : Promise<void> {
    let ports = await SBox.SignalBox.getSerialPorts();
    let port = ports.find(p => (p.vendorId == vendorID) && (p.productId == productID));
    if (port != undefined) {
      this.box = new SignalBox(port.path);

      this.box.on("data-read", (data) => {
        this.window.send("data-read", data);
      });

      await this.box.connect();
      this.window.send("signalbox-connected");
    }
  }

  async startAcquisition() : Promise<void> {
    await this.box!.run();
  }

  async stopAcquisition() : Promise<void> {
    await this.box!.stop();
  }

  installEventHandlers(): void {
    ipcMain.on("signalbox-start-acquisition", () => this.startAcquisition());
    ipcMain.on("signalbox-stop-acquisition", () => this.stopAcquisition());
  }
}
