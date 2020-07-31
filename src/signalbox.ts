import { WebContents, ipcMain } from "electron";
import { SignalBox } from "signalbox-sdk/dist/signal-box";
import { SignalGenerator } from "./signal-generator";
import { BoardInfo } from "signalbox-sdk/dist/board-info";

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
    let ports = await SignalBox.getSerialPorts();
    let port = ports.find(p => BoardInfo.getBoard(p.vendorId, p.productId));
    if (port != undefined) {
      this.box = new SignalBox(port.path, BoardInfo.getBoard(port.vendorId, port.productId)!);
      this.sGenerator = new SignalGenerator(this.box, this.window);

      this.box.on("data-read", async (data) => {
        this.window.send("data-read", data);
      });

      this.box.on("is-running", () => {
        this.sGenerator!.run();
      })

      await this.box.connect();
      this.window.send("signalbox-connected");
    }
  }

  async startAcquisition() : Promise<void> {
    await this.box!.run();
  }

  async stopAcquisition() : Promise<void> {
    this.sGenerator!.stop();
    await this.box!.stop();
  }

  updateSignalSettings(value: string | number) {
    if(typeof value == "string") {
      this.sGenerator!.setSignal(value);
    } else {
      this.sGenerator!.setSignal(this.sGenerator!.algorithm, value);
    }  
  }

  readWAVFile(path: string) : void {
    this.sGenerator?.setWAV(path);
  }

  installEventHandlers(): void {
    ipcMain.on("signalbox-start-acquisition", () => this.startAcquisition());
    ipcMain.on("signalbox-stop-acquisition", () => this.stopAcquisition());
    ipcMain.on("update-algorithm", (_, value) => this.updateSignalSettings(value));
    ipcMain.on("wav-file-loaded", (_, path) => this.readWAVFile(path));
  }
}
