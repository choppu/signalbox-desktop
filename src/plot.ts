import TimeChart from "timechart";
import { DataPoint } from "timechart/dist/types/renderModel";
import * as d3 from "d3";

export class Plot {
  chart: TimeChart;
  sampleInTime: number;
  sampleOutTime: number;
  dataInput: DataPoint[];
  dataOutput: DataPoint[];
  colors: string[];
  

  constructor(nameInput: string, nameOutput: string, lWidth: number, el: HTMLElement) {
    this.sampleInTime = 0;
    this.sampleOutTime = 0;
    this.dataInput = [];
    this.dataOutput = [];
    this.colors = ["lightpink", "crimson", "salmon", "orangered", "orange", "gold", 
    "lemonchiffon", "goldenrod", "maroon", "darkviolet", "slateblue", "seagreen", 
    "springgreen", "greenyellow", "teal", "turquoise", "blue", "royalblue", "powderblue"];

    let random = Math.floor(Math.random() * this.colors.length);
    this.chart = new TimeChart(el, {
      baseTime: this.sampleInTime,
      series: [{
        name: nameInput,
        data: this.dataInput,
        lineWidth: lWidth,
        color: d3.rgb("salmon"),
      },
      {
        name: nameOutput,
        data: this.dataOutput,
        lineWidth: lWidth,
        color: d3.rgb("teal"),
      }
    ],
      zoom: {
        x: {
            autoRange: true,
        },
        y: {
            autoRange: true
        }
      },
      realTime: true,
      yRange: {
        min: -0.1,
        max: 1.1
      },
      xRange: {
        min: 0,
        max: 1000
      }
    });
  }

  updatePlot(newData: number[], type: string) : void {
    if (type === "input") {
      for (let i = 0; i < newData.length; i++) {
        this.sampleInTime += 0.01;
        this.dataInput.push({x: this.sampleInTime, y: newData[i]});
      }
    } else {
      for (let i = 0; i < newData.length; i++) {
        this.sampleOutTime += 0.01;
        this.dataOutput.push({x: this.sampleOutTime, y: newData[i]});
      }
    }

    this.chart.update();
  }
}