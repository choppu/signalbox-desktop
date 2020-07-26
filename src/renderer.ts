import { ipcRenderer } from "electron";
import { UI } from "./ui";

let startButton = document.getElementById("controls-btn-start");
let stopButton = document.getElementById("controls-btn-stop");

ipcRenderer.on("signalbox-connected", (_) => {
  UI.hideDefaultMessage(true);
  UI.enableControls(true);
  UI.initPlot();
});

ipcRenderer.on("data-read", (_, data) => {
  UI.updatePlot(data);
});

startButton?.addEventListener("click", (e) => {
  ipcRenderer.send("signalbox-start-acquisition");
  e.preventDefault;
});

stopButton?.addEventListener("click", (e) => {
  ipcRenderer.send("signalbox-stop-acquisition");
  e.preventDefault;
});

