import WebGLPlot, { ColorRGBA, WebglLine } from "webgl-plot";

export class Plot {
  devicePixelRatio: number;
  numX: number;
  color: ColorRGBA;
  line: WebglLine;
  wglp: WebGLPlot;
  window: Window;
  data: Float32Array;

  constructor(window: Window, canvas: HTMLCanvasElement) {
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.numX = Math.round(canvas.clientWidth * devicePixelRatio);
    this.color = new ColorRGBA(Math.random(), Math.random(), Math.random(), 1);
    this.line = new WebglLine(this.color, this.numX);
    this.wglp = new WebGLPlot(canvas);
    this.window = window;
    this.data = new Float32Array();
  }

  start() : void {
    this.window.requestAnimationFrame(() => {this.newFrame()});
  }

  addLine() : void {
    this.line.lineSpaceX(-1, 2 / this.numX);
    this.wglp.addLine(this.line);
  }

  newFrame() : void {
    this.line.shiftAdd(this.data);
    this.wglp.update();
    this.start();
  }
}