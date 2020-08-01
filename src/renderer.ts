import { ipcRenderer } from "electron";
import { UI } from "./ui";
import { Configuaration } from "./configuartion";
import { BoardInfo } from "signalbox-sdk/dist/board-info";
import { BoardConfiguration } from "signalbox-sdk/dist/board-configuration";

let controls = document.getElementsByClassName("signalbox__controls-btn");
let startButton = document.getElementById("controls-btn-start");
let stopButton = document.getElementById("controls-btn-stop");
let loadButton = document.getElementById("controls-btn-load") as HTMLInputElement;
let configureButton = document.getElementById("controls-btn-configure");
let resetButton = document.getElementById("controls-btn-reset-plot");

let signalModifiers = document.getElementsByClassName("signalbox__alg-btn");
let sineButton = document.getElementById("controls-btn-sine") as HTMLElement;
let squareButton = document.getElementById("controls-btn-square") as HTMLElement;
let triangleButton = document.getElementById("controls-btn-triangle") as HTMLElement;
let sawButton = document.getElementById("controls-btn-saw") as HTMLElement;
let revSawButton = document.getElementById("controls-btn-rev-saw") as HTMLElement;
let freqButton = document.getElementById("controls-btn-freq") as HTMLInputElement;
let muteButton = document.getElementById("controls-btn-mute") as HTMLElement;

let mainLayout = document.getElementById("main-container");
let configurationLayout = document.getElementById("configuration-container");

let boardInfo: BoardInfo;
let boardConfig: BoardConfiguration;

ipcRenderer.on("signalbox-connected", (_, info, config) => {
  boardInfo = info;
  boardConfig = config;
  UI.hideDefaultMessage(true);
  UI.enableButtons(controls, true);
  UI.enableButtons(signalModifiers, true);
  UI.initPlot();
});

ipcRenderer.on("data-read", (_, data) => {
  UI.updatePlot(data, "input");
});

ipcRenderer.on("data-output-updated", (_, data) => {
  UI.updatePlot(data, "output");
});

ipcRenderer.on("enable-start-button", (_) => UI.enableButton(startButton!, true));
ipcRenderer.on("enable-stop-button", (_) => UI.enableButton(stopButton!, true));

ipcRenderer.on("config-updated", (_, newConfig) => {
  boardConfig = newConfig;
})

startButton?.addEventListener("click", (e) => {
  ipcRenderer.send("signalbox-start-acquisition");
  UI.enableButton(stopButton!, false);
  UI.enableButton(configureButton!, false);
  e.preventDefault;
});

stopButton?.addEventListener("click", (e) => {
  ipcRenderer.send("signalbox-stop-acquisition");
  UI.enableButton(startButton!, false);
  UI.enableButton(configureButton!, true);
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

configureButton?.addEventListener("click", (e) => {
  UI.loadFragment(mainLayout!, configurationLayout!, () => Configuaration.update(boardInfo, boardConfig));
  e.preventDefault();
});

UI.updateSignalAlgorithm(sineButton, "sine");
UI.updateSignalAlgorithm(triangleButton, "triangle");
UI.updateSignalAlgorithm(squareButton, "square");
UI.updateSignalAlgorithm(sawButton, "sawtooth");
UI.updateSignalAlgorithm(revSawButton, "reverseSawtooth");
UI.updateSignalAlgorithm(muteButton, "none");
UI.updateSignalAlgorithm(freqButton);

