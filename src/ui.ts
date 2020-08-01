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

  export function enableButtons(btnsArray: HTMLCollectionOf<Element>, action: boolean) : void {
    for (let i = 0; i < btnsArray.length; i++) {
      action ? btnsArray[i].removeAttribute("disabled") : btnsArray[i].setAttribute("disabled", "disabled");
    }
  }

  export function enableButton(btn: HTMLElement, enabled: boolean) : void {
    enabled ? btn.removeAttribute("disabled") : btn.setAttribute("disabled", "disabled");
  }

  export function loadFragment(activeContainer: HTMLElement, newContainer: HTMLElement, onLoad?: () => void) : void {
    activeContainer?.classList.add("signalbox__hidden");
    newContainer?.classList.remove("signalbox__hidden");

    if(onLoad) {
      onLoad();
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

  export function prefillSelectField(field: HTMLSelectElement, opts: {label: string, value: number, maxValue?: number}[], val: number) : void {
    field.innerHTML = "";
    opts.forEach((selectOpt) => {
      let optionField = document.createElement('option');
      optionField.setAttribute('value', selectOpt.value.toString());
      optionField.classList.add("signalbox__select-option");
      optionField.innerHTML = selectOpt.label;
      optionField.selected = (selectOpt.value == val) ?  true : false;
      field.appendChild(optionField); 
    });
  }
}