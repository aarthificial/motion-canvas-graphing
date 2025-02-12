# Motion Canvas Graphing

[![npm](https://img.shields.io/npm/v/%40hhenrichsen%2Fmotion-canvas-graphing?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@hhenrichsen/motion-canvas-graphing)
[![GitHub](https://img.shields.io/github/v/tag/hhenrichsen/motion-canvas-graphing?style=for-the-badge&logo=github&label=GitHub) ](https://github.com/hhenrichsen/motion-canvas-graphing)
[![Static Badge](https://img.shields.io/badge/Donate-Kofi?style=for-the-badge&label=KoFi&color=%23FF5722)](https://ko-fi.com/hhenrichsen)

A library to help you make graphs in motion canvas.

If you use this in your videos, I would appreciate credit via a link to this
repo, or a mention by name. I would also love to see them; feel free to show me
on the motion canvas discord (I'm `@Hunter` on there).

If you want to support the development of this and other libraries, feel free to
donate on [Ko-fi](https://ko-fi.com/hhenrichsen).

## Demo

![](https://github.com/hhenrichsen/motion-canvas-graphing/releases/download/latest/output-big.gif)

```tsx
import {
  Plot,
  LinePlot,
  ScatterPlot,
} from "@hhenrichsen/motion-canvas-graphing";
import { makeScene2D } from "@motion-canvas/2d";
import {
  createRef,
  linear,
  range,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
export default makeScene2D(function* (view) {
  const random = useRandom();

  const plot = createRef<Plot>();
  view.add(
    <LinePlot
      size={500}
      ref={plot}
      xAxisLabel="Time"
      yAxisLabel="Beans"
      labelSize={10}
      graphWidth={4}
      graphColor={"red"}
      data={range(0, 26).map((i) => [i * 4, random.nextInt(0, 100)])}
    />
  );

  yield* plot().ticks(20, 3);
  yield* plot().size(1000, 2);
  yield* plot().labelSize(30, 2);
  yield* plot().min(-100, 2);
  yield* plot().opacity(0, 2);
  plot().remove();

  const plot2 = createRef<LinePlot>();
  view.add(
    <LinePlot
      size={500}
      ref={plot2}
      labelSize={0}
      graphWidth={4}
      graphColor={"red"}
      min={[-Math.PI * 2, -2]}
      end={0}
      max={[Math.PI * 2, 2]}
      xLabelFormatter={(x) => `${Math.round(x / Math.PI)}π`}
      ticks={[4, 4]}
    />
  );

  plot2().data(plot2().makeGraphData(0.1, (x) => Math.sin(x)));

  yield* plot2().end(1, 1);
  yield* waitFor(3);

  yield* plot2().opacity(0, 2);

  const plot3 = createRef<ScatterPlot>();
  view.add(
    <ScatterPlot
      size={500}
      ref={plot3}
      xAxisLabel="Time"
      yAxisLabel="Errors"
      labelSize={10}
      pointRadius={5}
      pointColor={"red"}
      end={0}
      data={range(0, 26).map((i) => [i * 4, random.nextInt(0, 100)])}
    />
  );

  yield* plot3().end(1, 3, linear);

  yield* waitFor(5);
});

});
```

## Using this library

### From git

1. Clone this repo.
1. Run `npm install <path to this repo>` in your motion canvas project
1. Set your `vite.config.ts` to look like this:

```ts
export default defineConfig({
  plugins: [motionCanvas()],
  resolve: {
    alias: {
      '@motion-canvas/core': path.resolve('./node_modules/@motion-canvas/core'),
      '@motion-canvas/2d': path.resolve('./node_modules/@motion-canvas/2d'),
    },
  },
});
```

### From npm

1. Run `npm install @hhenrichsen/motion-canvas-graphing`
1. Set your `vite.config.ts` to look like this:

```ts
export default defineConfig({
  plugins: [motionCanvas()],
  resolve: {
    alias: {
      '@motion-canvas/core': path.resolve('./node_modules/@motion-canvas/core'),
      '@motion-canvas/2d': path.resolve('./node_modules/@motion-canvas/2d'),
    },
  },
});
```
