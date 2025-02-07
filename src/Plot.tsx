import {
  CanvasStyleSignal,
  Rect,
  RectProps,
  canvasStyleSignal,
  computed,
  initial,
  resolveCanvasStyle,
  signal,
  vector2Signal,
} from '@motion-canvas/2d';
import {
  PossibleColor,
  PossibleVector2,
  SimpleSignal,
  Vector2,
  Vector2Signal,
} from '@motion-canvas/core';

export interface PlotProps extends RectProps {
  min?: PossibleVector2;
  max?: PossibleVector2;
  ticks?: PossibleVector2;
  labelSize?: PossibleVector2;
  labelPadding?: PossibleVector2;
  tickLabelSize?: PossibleVector2;
  tickOverflow?: PossibleVector2;

  gridStrokeWidth?: number;
  axisStrokeWidth?: number;

  xAxisColor?: PossibleColor;
  xAxisTextColor?: PossibleColor;
  xAxisLabel?: string;

  yAxisColor?: PossibleColor;
  yAxisTextColor?: PossibleColor;
  yAxisLabel?: string;

  xLabelFormatter?: (x: number) => string;
  yLabelFormatter?: (y: number) => string;
}

export class Plot extends Rect {
  @initial(Vector2.zero)
  @vector2Signal('min')
  public declare readonly min: Vector2Signal<this>;

  @initial(Vector2.one.mul(100))
  @vector2Signal('max')
  public declare readonly max: Vector2Signal<this>;

  @initial(Vector2.one.mul(10))
  @vector2Signal('ticks')
  public declare readonly ticks: Vector2Signal<this>;

  @initial(Vector2.one.mul(30))
  @vector2Signal('labelSize')
  public declare readonly labelSize: Vector2Signal<this>;

  @initial(Vector2.one.mul(10))
  @vector2Signal('labelPadding')
  public declare readonly labelPadding: Vector2Signal<this>;

  @initial(Vector2.one.mul(10))
  @vector2Signal('tickLabelSize')
  public declare readonly tickLabelSize: Vector2Signal<this>;

  @initial(Vector2.one.mul(5))
  @vector2Signal('tickOverflow')
  public declare readonly tickOverflow: Vector2Signal<this>;

  @initial(Vector2.one.mul(1))
  @vector2Signal('gridStrokeWidth')
  public declare readonly gridStrokeWidth: Vector2Signal<this>;

  @initial(Vector2.one.mul(2))
  @vector2Signal('axisStrokeWidth')
  public declare readonly axisStrokeWidth: Vector2Signal<this>;

  @initial('white')
  @canvasStyleSignal()
  public declare readonly xAxisColor: CanvasStyleSignal<this>;

  @initial('white')
  @canvasStyleSignal()
  public declare readonly xAxisTextColor: CanvasStyleSignal<this>;

  @initial('')
  @signal()
  public declare readonly xAxisLabel: SimpleSignal<string, this>;

  @initial('white')
  @canvasStyleSignal()
  public declare readonly yAxisColor: CanvasStyleSignal<this>;

  @initial('white')
  @canvasStyleSignal()
  public declare readonly yAxisTextColor: CanvasStyleSignal<this>;

  @initial('')
  @signal()
  public declare readonly yAxisLabel: SimpleSignal<string, this>;

  public readonly xLabelFormatter: (x: number) => string;
  public readonly yLabelFormatter: (y: number) => string;

  private progress = Vector2.createSignal();

  @computed()
  private edgePadding() {
    return this.labelSize()
      .add(this.labelPadding())
      .add(this.tickLabelSize().mul([Math.log10(this.max().y) + 1, 2]))
      .add(this.tickOverflow())
      .add(this.axisStrokeWidth());
  }

  @computed()
  private gridSize() {
    return this.size().sub(this.edgePadding());
  }

  public constructor(props?: PlotProps) {
    super(props);
    this.xLabelFormatter = props.xLabelFormatter ?? (x => x.toFixed(0));
    this.yLabelFormatter = props.yLabelFormatter ?? (y => y.toFixed(0));
  }

  protected drawShape(context: CanvasRenderingContext2D): void {
    const tl = this.topLeft().add(this.edgePadding().mul([1, 0]));

    for (let i = 0; i <= this.ticks().floored.x; i++) {
      const startPosition = tl.add(
        this.gridSize().mul([i / this.ticks().x, 1]),
      );

      context.beginPath();
      context.moveTo(
        startPosition.x,
        startPosition.y +
          this.tickOverflow().x +
          this.axisStrokeWidth().x / 2 +
          this.axisStrokeWidth().x / 2,
      );
      context.lineTo(startPosition.x, tl.y);
      context.strokeStyle = resolveCanvasStyle(this.xAxisColor(), context);
      context.lineWidth = this.gridStrokeWidth().x;
      context.stroke();

      context.fillStyle = resolveCanvasStyle(this.xAxisTextColor(), context);
      context.font = `${this.tickLabelSize().y}px sans-serif`;
      context.textAlign = 'right';
      context.fillText(
        `${this.xLabelFormatter(this.mapToX(i / this.ticks().x))}`,
        startPosition.x,
        startPosition.y +
          this.tickLabelSize().x +
          this.tickOverflow().x +
          this.axisStrokeWidth().x,
      );
    }

    for (let i = 0; i <= this.ticks().floored.y; i++) {
      const startPosition = tl.add(
        this.gridSize().mul([1, 1 - i / this.ticks().y]),
      );

      context.beginPath();
      context.moveTo(startPosition.x, startPosition.y);
      context.lineTo(
        tl.x - this.tickOverflow().y - this.axisStrokeWidth().y,
        startPosition.y,
      );
      context.strokeStyle = resolveCanvasStyle(this.yAxisColor(), context);
      context.lineWidth = this.gridStrokeWidth().y;
      context.stroke();

      context.fillStyle = resolveCanvasStyle(this.yAxisTextColor(), context);
      context.font = `${this.tickLabelSize().y}px ${this.fontFamily()}`;
      context.textAlign = 'right';
      context.fillText(
        `${this.yLabelFormatter(this.mapToY(i / this.ticks().y))}`,
        tl.x -
          this.tickLabelSize().y -
          this.tickOverflow().y -
          this.axisStrokeWidth().y,
        startPosition.y + this.tickLabelSize().y / 2,
      );
    }

    context.beginPath();
    const yAxisStartPoint = this.getPointFromPlotSpace([0, this.min().y]);
    const yAxisEndPoint = this.getPointFromPlotSpace([0, this.max().y]);
    context.moveTo(
      yAxisStartPoint.x - this.gridStrokeWidth().y / 2,
      yAxisStartPoint.y - this.gridStrokeWidth().y / 2,
    );
    context.lineTo(
      yAxisEndPoint.x - this.gridStrokeWidth().y / 2,
      yAxisEndPoint.y + this.gridStrokeWidth().y / 2,
    );
    context.strokeStyle = resolveCanvasStyle(this.xAxisColor(), context);
    context.lineWidth = this.axisStrokeWidth().x;
    context.stroke();

    context.beginPath();
    const xAxisStartPoint = this.getPointFromPlotSpace([this.min().x, 0]);
    const xAxisEndPoint = this.getPointFromPlotSpace([this.max().x, 0]);
    context.moveTo(
      xAxisStartPoint.x - this.gridStrokeWidth().x / 2,
      xAxisStartPoint.y + this.gridStrokeWidth().x / 2,
    );
    context.lineTo(
      xAxisEndPoint.x + this.gridStrokeWidth().x / 2,
      xAxisEndPoint.y + this.gridStrokeWidth().x / 2,
    );
    context.strokeStyle = resolveCanvasStyle(this.yAxisColor(), context);
    context.lineWidth = this.axisStrokeWidth().y;
    context.stroke();

    // Draw X axis label
    context.fillStyle = resolveCanvasStyle(this.xAxisTextColor(), context);
    context.font = `${this.labelSize().y}px ${this.fontFamily()}`;
    context.textAlign = 'center';
    context.fillText(
      this.xAxisLabel(),
      this.bottom().x + this.edgePadding().x / 2,
      this.bottom().y - this.labelPadding().x / 2,
    );

    // Draw rotated Y axis label
    context.fillStyle = resolveCanvasStyle(this.yAxisTextColor(), context);
    context.font = `${this.labelSize().y}px ${this.fontFamily()}`;
    context.textAlign = 'center';
    context.save();
    context.translate(
      this.left().x + this.labelPadding().y / 2 + this.labelSize().y,
      this.left().y - this.edgePadding().y / 2,
    );
    context.rotate(-Math.PI / 2);
    context.fillText(this.yAxisLabel(), 0, 0);
    context.restore();
  }

  public getPointFromPlotSpace(point: PossibleVector2) {
    const bottomLeft = this.bottomLeft().add(this.edgePadding().mul([1, -1]));
    const delta = this.topRight().sub(bottomLeft);
    return bottomLeft.add(this.toRelativeGridSize(point).mul(delta));
  }

  private mapToX(value: number) {
    return this.min().x + value * (this.max().x - this.min().x);
  }

  private mapToY(value: number) {
    return this.min().y + value * (this.max().y - this.min().y);
  }

  private toRelativeGridSize(p: PossibleVector2) {
    return new Vector2(p).sub(this.min()).div(this.max().sub(this.min()));
  }
}
