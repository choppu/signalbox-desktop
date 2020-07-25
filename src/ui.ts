import WebGLplot, { WebglLine, ColorRGBA } from "webgl-plot";
import { Plot } from "./plot";
import { ipcRenderer } from "electron";

export namespace UI {
  let plotCanvas: Plot;

  export function hideDefaultMessage(action: boolean) : void {
    let message = document.getElementById("plot-message");

    if(action) {
      message!.classList.add("signalbox__hidden");
    } else {
      message!.classList.remove("signalbox__hidden");
    }
  }

  export function enableControls(action: boolean) : void {
    let buttons = document.getElementsByClassName("signalbox__controls-btn");

    for (let i = 0; i < buttons.length; i++) {
      action ? buttons[i].removeAttribute("disabled") : buttons[i].setAttribute("disabled", "disabled");
    }
  }

  export function initPlot() : void {
    let canv = document.getElementById("signalbox_canvas") as HTMLCanvasElement;
    plotCanvas = new Plot(window, canv);
    plotCanvas.addLine();
    plotCanvas.start();
  }

  export function updatePlot(data: number[]) : void {
    plotCanvas.data = new Float32Array(data);
  }
}