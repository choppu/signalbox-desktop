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
    let plotContainer = document.getElementById("signalbox_plot") as HTMLElement;
    plotCanvas = new Plot("Input", "Output", 2, plotContainer);
  }

  export function updatePlot(data: number[], type: string) : void {
    plotCanvas.updatePlot(data, type);
  }

  export function resetPlot() : void {
    plotCanvas.resetData();
  }

  export function updateSignalAlgorithm(btn: HTMLInputElement | HTMLElement, value?: string) {
    if(value) {
      btn.addEventListener("click", () => ipcRenderer.send("update-algorithm", value));
    } else {
      let el = btn as HTMLInputElement;
      el.addEventListener("change", (e) => {
        if(el.value) {
          ipcRenderer.send("update-algorithm", parseInt(el.value, 10));
        } else {
          ipcRenderer.send("update-algorithm", parseInt(el.value, 1));
          el.value = "1";
        }
        e.preventDefault();
      }); 
    }
  }
}