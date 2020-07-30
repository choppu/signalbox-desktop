import { ipcRenderer } from "electron";
import { UI } from "./ui";

let startButton = document.getElementById("controls-btn-start");
let stopButton = document.getElementById("controls-btn-stop");
let loadButton = document.getElementById("controls-btn-load") as HTMLInputElement;
let resetButton = document.getElementById("controls-btn-reset-plot");

let sineButton = document.getElementById("controls-btn-sine") as HTMLElement;
let squareButton = document.getElementById("controls-btn-square") as HTMLElement;
let triangleButton = document.getElementById("controls-btn-triangle") as HTMLElement;
let sawButton = document.getElementById("controls-btn-saw") as HTMLElement;
let revSawButton = document.getElementById("controls-btn-rev-saw") as HTMLElement;
let freqButton = document.getElementById("controls-btn-freq") as HTMLInputElement;
let muteButton = document.getElementById("controls-btn-mute") as HTMLElement;

ipcRenderer.on("signalbox-connected", (_) => {
  UI.hideDefaultMessage(true);
  UI.enableControls(true);
  UI.initPlot();
});

ipcRenderer.on("data-read", (_, data) => {
  UI.updatePlot(data, "input");
});

ipcRenderer.on("data-output-updated", (_, data) => {
  UI.updatePlot(data, "output");
});

startButton?.addEventListener("click", (e) => {
  ipcRenderer.send("signalbox-start-acquisition");
  e.preventDefault;
});

stopButton?.addEventListener("click", (e) => {
  ipcRenderer.send("signalbox-stop-acquisition");
  e.preventDefault;
});

resetButton?.addEventListener("click", (e) => {
  UI.resetPlot();
  e.preventDefault;
});

loadButton?.addEventListener("input", (e) => {
  if(loadButton!.files![0].path) {
    ipcRenderer.send("wav-file-loaded", loadButton!.files![0].path);
    e.preventDefault();
  }
});


UI.updateSignalAlgorithm(sineButton, "sine");
UI.updateSignalAlgorithm(triangleButton, "triangle");
UI.updateSignalAlgorithm(squareButton, "square");
UI.updateSignalAlgorithm(sawButton, "sawtooth");
UI.updateSignalAlgorithm(revSawButton, "reverseSawtooth");
UI.updateSignalAlgorithm(muteButton, "none");
UI.updateSignalAlgorithm(freqButton);

