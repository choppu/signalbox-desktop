import { ipcRenderer } from "electron";
import { UI } from "./ui";

let startButton = document.getElementById("controls-btn-start");
let stopButton = document.getElementById("controls-btn-stop");

let sineButton = document.getElementById("controls-btn-sine") as HTMLInputElement;
let squareButton = document.getElementById("controls-btn-square") as HTMLInputElement;
let triangleButton = document.getElementById("controls-btn-triangle") as HTMLInputElement;
let sawButton = document.getElementById("controls-btn-saw") as HTMLInputElement;
let revSawButton = document.getElementById("controls-btn-rev-saw") as HTMLInputElement;
let freqButton = document.getElementById("controls-btn-freq") as HTMLInputElement;

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

UI.updateSignalAlgorithm(sineButton, "sine");
UI.updateSignalAlgorithm(triangleButton, "triangle");
UI.updateSignalAlgorithm(squareButton, "square");
UI.updateSignalAlgorithm(sawButton, "sawtooth");
UI.updateSignalAlgorithm(revSawButton, "reverseSawtooth");
UI.updateSignalAlgorithm(freqButton);

