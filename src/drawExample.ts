import {
  XyzDataSeries,
  NumericAxis,
  FastBubbleRenderableSeries,
  SciChartSurface,
  EllipsePointMarker,
  EFillPaletteMode,
  EStrokePaletteMode,
  IPointMarkerPaletteProvider,
  TPointMarkerArgb,
  IPointMetadata,
  MouseWheelZoomModifier,
  ZoomExtentsModifier,
  ZoomPanModifier,
  parseColorToUIntArgb,
  SweepAnimation,
  DataPointSelectionModifier,
  TextAnnotation,
  EHorizontalAnchorPoint,
  EVerticalAnchorPoint,
  ECoordinateMode,
} from "scichart";

import * as d3 from "d3";

import { appTheme } from "./theme";

type FizzBuzzItem = {
  label: string | number;
  value: number;
  radius?: number;
  x?: number;
  y?: number;
  r?: number;
  isSelected: boolean;
};

export const drawExample = async (rootElement: string | HTMLDivElement) => {
  // Create a SciChartSurface with X,Y Axis
  const { sciChartSurface, wasmContext } = await SciChartSurface.create(
    rootElement,
    {
      theme: appTheme.SciChartJsTheme,
    }
  );

  const fizzBuzz = (function (count) {
    const arr = [];
    for (let i = 1; i <= count; i += 1) {
      if (i % 3 === 0 && i % 5 === 0) {
        const fizzbuzz: FizzBuzzItem = {
          label: "",
          value: 0,
          isSelected: false,
        };
        fizzbuzz.label = "FizzBuzz";
        fizzbuzz.value = i;
        arr.push(fizzbuzz);
      } else if (i % 3 === 0) {
        const fizz: FizzBuzzItem = {
          label: "",
          value: 0,
          isSelected: false,
        };
        fizz.label = "Fizz";
        fizz.value = i;
        arr.push(fizz);
      } else if (i % 5 === 0) {
        const buzz: FizzBuzzItem = {
          label: "",
          value: 0,
          isSelected: false,
        };
        buzz.label = "Buzz";
        buzz.value = i;
        arr.push(buzz);
      } else {
        const obj: FizzBuzzItem = {
          label: "",
          value: 0,
          isSelected: false,
        };
        obj.label = i;
        obj.value = i;
        arr.push(obj);
      }
    }
    return arr;
  })(100);

  function shuffle(array: FizzBuzzItem[]) {
    array.sort(() => Math.random() - 0.5);
  }

  shuffle(fizzBuzz);

  console.log(fizzBuzz);

  const width = 900;
  const height = 600;

  const rScale = d3.scaleLinear().domain([1, 100]).range([10, 30]);

  // forceSimulation data manipulation

  // fizzBuzz.forEach(function (item) {
  //   item.radius = rScale(item.value);
  // });

  // d3.forceSimulation(fizzBuzz)
  //   .force("x", d3.forceX(width / 2))
  //   .force("y", d3.forceY(height / 2))
  //   .force(
  //     "collide",
  //     d3.forceCollide<FizzBuzzItem>().radius((d) => {
  //       return d.radius! + 50;
  //     })
  //   );

  // const simulation = d3.forceSimulation(fizzBuzz)
  // // .force("link", d3.forceLink(links).distance(100))
  // .force("charge", d3.forceManyBody().strength(-10))
  // .force("center", d3.forceCenter(width / 2, height / 2))
  // .on("tick", ticked);

  // forceSimulation data manipulation

  // circle packing version
  const pack = d3
    .pack()
    .size([width, height])
    .padding(1)
    .radius((d) => rScale(d.value!));

  const hierarchy = d3
    .hierarchy<{ children: FizzBuzzItem[] }>({ children: fizzBuzz })
    .sum((d) => (d as unknown as FizzBuzzItem).value);

  // @ts-expect-error: TypeScript does not recognize the structure of the hierarchy data
  const packedCircles = pack(hierarchy).leaves();

  // circle packing version

  sciChartSurface.xAxes.add(new NumericAxis(wasmContext, { isVisible: false }));
  sciChartSurface.yAxes.add(
    new NumericAxis(wasmContext, {
      isVisible: false,
    })
  );

  sciChartSurface.zoomExtents();

  // force data
  // const xValues = fizzBuzz.map((d) => d.x) as number[];
  // const yValues = fizzBuzz.map((d) => d.y) as number[];
  // const zValues = fizzBuzz.map((d) => d.radius) as number[];
  // const metadata = fizzBuzz;
  // force data

  // packedCircles data
  const xValues = packedCircles.map((d) => d.x) as number[];
  const yValues = packedCircles.map((d) => d.y) as number[];
  const zValues = packedCircles.map((d) => d.r) as number[];
  const metadata = packedCircles.map((d) => d.data) as IPointMetadata[];
  // packedCircles data

  // text annonations
  const title = new TextAnnotation({
    text: "FizzBuzz Demo",
    fontSize: 24,
    x1: 450,
    y1: 600,
    textColor: "#ffffff",
    horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
    fontWeight: "bold",
  });

  const subTitle = new TextAnnotation({
    text: "Find the number 50",
    fontSize: 16,
    x1: 450,
    y1: 560,
    textColor: "#ffffff",
    horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
    fontWeight: "bold",
  });

  const congratulations = new TextAnnotation({
    text: "Congratulations!",
    x1: 0.5,
    y1: 0.5,
    textColor: "#ffffff",
    opacity: 0.7,
    horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
    verticalAnchorPoint: EVerticalAnchorPoint.Center,
    fontSize: 48,
    fontWeight: "Bold",
    xCoordinateMode: ECoordinateMode.Relative, // xCoordinateMode relative allows 0..1 to correspond to viewport left/right
    yCoordinateMode: ECoordinateMode.Relative, // yCoordinateMode relative allows 0..1 to correspond to viewport top/bottom
  });

  sciChartSurface.annotations.add(title, subTitle);

  // text annonations

  // The Bubble series requires a special dataseries type called XyzDataSeries with X,Y and Z (size) values
  sciChartSurface.renderableSeries.add(
    new FastBubbleRenderableSeries(wasmContext, {
      dataSeries: new XyzDataSeries(wasmContext, {
        xValues,
        yValues,
        zValues,
        metadata,
      }),
      // Pointmarker defines the marker shown per-bubble point. This will be scaled according to z-value
      pointMarker: new EllipsePointMarker(wasmContext, {
        width: 64,
        height: 64,
        strokeThickness: 0,
        fill: appTheme.VividSkyBlue, // + "90",
      }),
      dataLabels: {
        style: {
          fontFamily: "Arial",
          fontSize: 16,
        },
        color: "#EEE",
        metaDataSelector: (md) => {
          const metadata = md as unknown as FizzBuzzItem;
          return metadata.label.toString();
        },
      },
      // Optional: Allows per-point colouring of bubble stroke
      paletteProvider: new BubblePaletteProvider(),
      animation: new SweepAnimation({
        delay: 200,
        duration: 500,
        fadeEffect: true,
      }),
    })
  );

  // *click event test*
  sciChartSurface.chartModifiers.add(
    new DataPointSelectionModifier({
      onSelectionChanged: (args) => {
        console.log(`${args.selectedDataPoints.length} datapoints selected!`);

        args.selectedDataPoints.forEach((dataPoint) => {
          const clickedNumber = (dataPoint.metadata as FizzBuzzItem).value;

          console.log(clickedNumber);

          if ((dataPoint.metadata as FizzBuzzItem).value === 50) {
            congratulations.text = `Congratulations!`;

            sciChartSurface.annotations.add(congratulations);

            setTimeout(() => {
              sciChartSurface.annotations.remove(congratulations);
            }, 2000);
          } else {
            congratulations.text = `You have clicked on number ${clickedNumber}!`;

            sciChartSurface.annotations.add(congratulations);

            setTimeout(() => {
              sciChartSurface.annotations.remove(congratulations);
            }, 2000);
          }
        });
      },
    })
  );
  // *click event test*

  // Add some zooming and panning behaviour
  sciChartSurface.chartModifiers.add(new ZoomPanModifier({ enableZoom: true }));
  sciChartSurface.chartModifiers.add(new ZoomExtentsModifier());
  sciChartSurface.chartModifiers.add(new MouseWheelZoomModifier());
  // sciChartSurface.background = "Transparent";

  sciChartSurface.zoomExtents();
  return { sciChartSurface, wasmContext };
};

/**
 * Optional: An example PaletteProvider which implements IPointMarkerPaletteProvider
 * This can be attached to Scatter or Bubble series to change the stroke or fill
 * of the series point-markers conditionally
 */
class BubblePaletteProvider implements IPointMarkerPaletteProvider {
  public readonly fillPaletteMode = EFillPaletteMode.SOLID;
  public readonly strokePaletteMode: EStrokePaletteMode =
    EStrokePaletteMode.SOLID;
  // private readonly fillArgb: number;

  // constructor(fillHexString: string) {
  //   this.fillArgb = parseColorToUIntArgb(fillHexString);
  // }

  public onAttached(): void {}

  public onDetached(): void {}


  public overridePointMarkerArgb(
    _xValue: number,
    _yValue: number,
    _index: number,
    _opacity?: number,
    metadata?: IPointMetadata
  ): TPointMarkerArgb {
    return {
      fill: parseColorToUIntArgb(
        d3
          .rgb(200, 255 - (metadata as FizzBuzzItem).value * 2.55, 20)
          .formatHex()
      ),
      stroke: parseColorToUIntArgb("#000"),
    };
  }
}
