import { BoardInfo } from "signalbox-sdk/dist/board-info";
import { BoardConfiguration } from "signalbox-sdk/dist/board-configuration";
import { UI } from "./ui";
import { ipcRenderer } from "electron";
import { ADCConfiguration } from "signalbox-sdk/dist/adc-configuation";
import { DACConfiguration } from "signalbox-sdk/dist/dac-configuration";
import { OPAMPConfiguration } from "signalbox-sdk/dist/opamp-configuration";

let adcForm = document.getElementById("adc-form");
let dacForm = document.getElementById("dac-form");
let opampForm = document.getElementById("opamp-form");
let opampTwoForm = document.getElementById("opamp2-form");

let opampEnabled = document.getElementById("opamp-enabled") as HTMLInputElement;
let opamp2Enabled = document.getElementById("opamp2-enabled") as HTMLInputElement;
let adcEnabled = document.getElementById("adc-enabled") as HTMLInputElement;
let dacEnabled = document.getElementById("dac-enabled") as HTMLInputElement;

let opampInvertingInput = document.getElementById("opamp-inv-input") as HTMLInputElement;
let opamp2InvertingInput = document.getElementById("opamp2-inv-input") as HTMLInputElement;

let adcSelect = document.getElementById("adc-oversampling") as HTMLSelectElement;
let opampSelect = document.getElementById("opamp-gain") as HTMLSelectElement;
let opamp2Select = document.getElementById("opamp2-gain") as HTMLSelectElement;
let samplingTimeSelect = document.getElementById("adc-sampling-time") as HTMLSelectElement;

let adcPrescaler = document.getElementById("adc-prescaler") as HTMLInputElement;
let dacPrescaler = document.getElementById("dac-prescaler") as HTMLInputElement;

let adcPeriod = document.getElementById("adc-period") as HTMLInputElement;
let dacPeriod = document.getElementById("dac-period") as HTMLInputElement;

let adcSamplingRate = document.getElementById("adc-samp-rate") as HTMLInputElement;
let dacSamplingRate = document.getElementById("dac-samp-rate") as HTMLInputElement;

let adcSamplingRateMsg = document.getElementById("adc-frequency-message");
let dacSamplingRateMsg = document.getElementById("dac-frequency-message");

export namespace Configuaration {
  export function update(boardInfo: BoardInfo, boardConfig: BoardConfiguration) : void {
    let mainLayout = document.getElementById("main-container");
    let configurationLayout = document.getElementById("configuration-container");
    let submitBtn = document.getElementById("configuration-btn-submit");
    let cancelBtn = document.getElementById("configuration-btn-cancel");

    let maxADCPrescaler = Math.pow(2, 8 * boardInfo.adc[0].prescalerSize);
    let maxDACPrescaler = Math.pow(2, 8 * boardInfo.dac[0].prescalerSize);
    let maxADCPeriod = Math.pow(2, 8 * boardInfo.adc[0].periodSize);
    let maxDACPeriod = Math.pow(2, 8 * boardInfo.dac[0].periodSize);

    prefillConfiguration(boardInfo, boardConfig);
    prefillCalculatedSamplingRate(adcPrescaler, adcPeriod, adcSamplingRate, boardInfo.frequency, maxADCPrescaler, maxDACPrescaler, adcSamplingRateMsg!);
    prefillCalculatedSamplingRate(dacPrescaler, dacPeriod, dacSamplingRate, boardInfo.frequency, maxADCPeriod, maxDACPeriod, dacSamplingRateMsg!);

    submitBtn?.addEventListener("click", (e) => {
      let newConfiguration = newConfig(boardConfig);
      ipcRenderer.send("update-configuration", newConfiguration);
      UI.loadFragment(configurationLayout!, mainLayout!);
      e.preventDefault();
    });

    cancelBtn?.addEventListener("click", (e) => {
      UI.loadFragment(configurationLayout!, mainLayout!);
      e.preventDefault();
    });
  }

  export function prefillConfiguration(boardInfo: BoardInfo, boardConfig: BoardConfiguration) : void {
    adcEnabled.checked = boardConfig.adcConfiguration[0].enabled;
    UI.prefillSelectField(adcSelect, boardInfo.adc[0].supportedOversampling as {label: string, value: number}[], boardConfig.adcConfiguration[0].oversampling);
    UI.prefillSelectField(samplingTimeSelect, boardInfo.adc[0].supportedSamplingTimes as {label: string, value: number}[], boardConfig.adcConfiguration[0].channelConfig[0].sampleTime);
    adcPrescaler.value = boardConfig.adcConfiguration[0].prescaler.toString();
    adcPeriod.value = boardConfig.adcConfiguration[0].period.toString();
    adcSamplingRate.value = BoardInfo.getSampleFrequency(boardConfig.adcConfiguration[0].prescaler, boardConfig.adcConfiguration[0].period, boardInfo.frequency).toString();

    dacEnabled.checked = boardConfig.dacConfiguration[0].enabled;
    dacPrescaler.value = boardConfig.dacConfiguration[0].prescaler.toString();
    dacPeriod.value = boardConfig.dacConfiguration[0].period.toString();
    dacSamplingRate.value = BoardInfo.getSampleFrequency(boardConfig.dacConfiguration[0].prescaler, boardConfig.dacConfiguration[0].period, boardInfo.frequency).toString();

    opampEnabled.checked = boardConfig.opampConfiguration[0].enabled;
    UI.prefillSelectField(opampSelect, boardInfo.opamp[0].supportedGains as {label: string, value: number}[], boardConfig.opampConfiguration[0].gain);
    opampInvertingInput.checked = boardConfig.opampConfiguration[0].invertingInput;


    opamp2Enabled.checked = boardConfig.opampConfiguration[1].enabled;
    UI.prefillSelectField(opamp2Select, boardInfo.opamp[0].supportedGains as {label: string, value: number}[], boardConfig.opampConfiguration[1].gain);
    opamp2InvertingInput.checked = boardConfig.opampConfiguration[1].invertingInput;
  }

  export function prefillCalculatedSamplingRate(prescaler: HTMLInputElement, period: HTMLInputElement, samplingRate: HTMLInputElement, freq: number, maxPrescaler: number, maxPeriod: number, msgContainer: HTMLElement) {
    prescaler.addEventListener("change", (e) => {
      msgContainer.innerHTML = (msgContainer.innerHTML != "") ? "" : msgContainer.innerHTML;
      samplingRate.value = BoardInfo.getSampleFrequency(parseInt(prescaler.value, 10), parseInt(period.value, 10), freq).toString();
      e.preventDefault();
    });

    period.addEventListener("change", (e) => {
      msgContainer.innerHTML = (msgContainer.innerHTML != "") ? "" : msgContainer.innerHTML;
      samplingRate.value = BoardInfo.getSampleFrequency(parseInt(prescaler.value, 10), parseInt(period.value, 10), freq).toString();
      e.preventDefault();
    });

    samplingRate.addEventListener("change", (e) => {
      let dataObj = BoardInfo.getPrescalerAndPeriod(parseInt(samplingRate.value), maxPrescaler, maxPeriod, freq);
      prescaler.value = dataObj.prescaler.toString();
      period.value = dataObj.period.toString();

      if(!dataObj.precise) {
        let newSampRate = BoardInfo.getSampleFrequency(dataObj.prescaler, dataObj.period, freq);
        msgContainer.innerHTML = `${samplingRate.value}Hz cannot be achieved.`;
        samplingRate.value = newSampRate.toString();
      } else {
        msgContainer.innerHTML = "";
      }

      e.preventDefault();
    });
  }

  export function newConfig(boardConfig: BoardConfiguration) : BoardConfiguration {
    return new BoardConfiguration(
      [new ADCConfiguration(
        0, 
        adcEnabled.checked, 
        parseInt(adcSelect.value, 10), 
        parseInt(adcPrescaler.value, 10), 
        parseInt(adcPeriod.value, 10), 
        [{enabled: boardConfig.adcConfiguration[0].channelConfig[0].enabled, sampleTime: parseInt(samplingTimeSelect.value, 10)}]
      )],
      [new DACConfiguration(
        0,
        dacEnabled.checked,
        parseInt(dacPrescaler.value, 10), 
        parseInt(dacPeriod.value, 10), 
        [boardConfig.dacConfiguration[0].channelEnabled[0]]
      )],
      [new OPAMPConfiguration(
        0, 
        opampEnabled.checked,
        parseInt(opampSelect.value, 10), 
        opampInvertingInput.checked
      ),
      new OPAMPConfiguration(
        1, 
        opamp2Enabled.checked,
        parseInt(opamp2Select.value, 10), 
        opamp2InvertingInput.checked
      )]);
  }
 }