import TimeChart from "timechart";
import { DataPoint } from "timechart/dist/types/renderModel";
import * as d3 from "d3";

export class Plot {
  chart: TimeChart;
  sampleTime: number;
  data: DataPoint[];
  colors: string[];
  

  constructor(name: string, lWidth: number, el: HTMLElement) {
    this.sampleTime = 0;
    this.data = [];
    this.colors = ["lightpink", "crimson", "salmon", "orangered", "orange", "gold", 
    "lemonchiffon", "goldenrod", "maroon", "darkviolet", "slateblue", "seagreen", 
    "springgreen", "greenyellow", "teal", "turquoise", "blue", "royalblue", "powderblue"];

    let random = Math.floor(Math.random() * this.colors.length);
    this.chart = new TimeChart(el, {
      baseTime: this.sampleTime,
      series: [{
        name: name,
        data: this.data,
        lineWidth: lWidth,
        color: d3.rgb(this.colors[random]),
      }],
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

  updatePlot(newData: number[]) : void {
    for (let i = 0; i < newData.length; i++) {
      this.sampleTime += 0.01;
      this.data.push({x: this.sampleTime, y: newData[i]});
    }

    this.chart.update();
  }
}