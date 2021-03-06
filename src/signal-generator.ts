import { SignalBox } from "signalbox-sdk/dist/signal-box";
import { WebContents} from "electron";
import { BoardInfo } from "signalbox-sdk/dist/board-info";

const oneOnPI = 1.0 / Math.PI;
const twoOnPI = 2.0 / Math.PI;
const tau = 2.0 * Math.PI;

const fs = require('fs');
let wav = require('node-wav');

export class SignalGenerator {
  box: SignalBox;
  isRunning: boolean;
  algorithm: string;
  frequency: number;
  rate: number;
  phase: number;
  syncPhase: number;
  center: number;
  window: WebContents;
  wavBuffer: any;
  wavReadCounter: number;

  constructor(sB: SignalBox, window: WebContents, algorithm = "none", frequency = 2.0) {
    this.box = sB;
    this.isRunning = false;
    this.algorithm = algorithm;
    this.frequency = frequency;
    this.rate = BoardInfo.getSampleFrequency(this.box.configuration.dacConfiguration[0].prescaler, this.box.configuration.dacConfiguration[0].period, this.box.boardInfo.frequency);
    this.phase = 0.0;
    this.center = Math.PI;
    this.syncPhase = tau;
    this.window = window;
    this.wavBuffer = null;
    this.wavReadCounter = 0;
  }

  run() : void {
    if(!this.isRunning) {
      this.rate = BoardInfo.getSampleFrequency(this.box.configuration.dacConfiguration[0].prescaler, this.box.configuration.dacConfiguration[0].period, this.box.boardInfo.frequency);
      this.isRunning = true;
      this.generateSignalOutput();
    } 
  }

  stop() : void {
    this.isRunning = false;
  }

  doGetSample() : number {
    let sample = 0.0;
    switch (this.algorithm) {
      case "sine":
        sample = Math.sin(this.phase);
        break;
      case "sawtooth":
        sample = (oneOnPI * this.phase) - 1.0;
        break;
      case "reverseSawtooth":
        sample = 1.0 - (oneOnPI * this.phase);
        break;
      case "triangle":
        if (this.phase < this.center) {
          sample = -1.0 + (twoOnPI * this.phase);
        } else {
          sample = 3.0 - (twoOnPI * this.phase);
        }
        break;
      case "square": 
        if (this.phase < this.center) {
          sample = 1.0;
        } else {
          sample = -1.0;
        }
        break;  
      case "wav":
        sample = this.wavBuffer.channelData[0][this.wavReadCounter++];
        this.wavReadCounter = this.wavReadCounter % this.wavBuffer.channelData[0].length;
        break;  
      case "none": 
        sample = -1.0;  
        break;
    }

    return ((sample + 1.0) / 2.0);
  }

  calculatePhase(phase: number) : number {
    if (phase >= this.syncPhase) {
      phase = phase - this.syncPhase;
    }

    return phase;
  }

  getSample() : number {
    let sample = this.doGetSample();
    let phaseDelta = (tau * this.frequency) / this.rate;
    this.phase = this.calculatePhase(this.phase + phaseDelta);
    return sample;
  }

  async generateSignalOutput() : Promise<void> {
    while(this.isRunning) {
      let data = [];

      for(let i = 0; i < 32768; i++) {
        data.push(this.getSample());
      }

      this.window.send("data-output-updated", data);
      await this.box.write(data);
    }
  }

  setWAV(path: string) : void {
    let file = fs.readFileSync(path);
    this.wavBuffer = wav.decode(file);
    this.algorithm = "wav";
  }

  setSignal(algorithm: string, frequency = this.frequency) : void {
    this.algorithm = algorithm;
    this.frequency = frequency;
  }
}