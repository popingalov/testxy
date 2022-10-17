import { FC, useRef, useEffect, useState } from 'react';
import s from './Canvas.module.scss';
import throttle from 'lodash.throttle';
interface CanvasProps {
  (): JSX.Element;
}
type CanvasHTML = React.MouseEvent<HTMLCanvasElement>;
type Canva = CanvasRenderingContext2D | null | undefined;
type Obj = { start: { x: number; y: number }; end: { x: number; y: number } };
type String = string;
type Result = number[] | false;
const Canvas: CanvasProps = () => {
  let mass = useRef<HTMLCanvasElement>(null);
  const ctx: Canva = mass.current?.getContext('2d');
  const [position, setPosition]: any = useState();
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [triger, setTriger]: any = useState();
  const [lineArr, setLineArr]: any = useState([]);
  const [dot, setDot]: any = useState([]);
  const [dotA, setDotA]: any = useState([]);
  const [drawTrig, setDrawTriger]: any = useState(false);
  const [randomTriger, setRandomTriger]: any = useState(true);

  useEffect(() => {
    setTriger(false);

    setPosition({ y: mass.current?.offsetTop, x: mass.current?.offsetLeft });
  }, []);

  function draw(): void {
    lineArr.forEach((e: any) => {
      drawLine(ctx, e);
    });
  }

  function drawLine(ctx: Canva, line: Obj): void {
    const { start, end } = line;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = 2;

      ctx.stroke();
    }
  }
  function calc(e: CanvasHTML): { x: number; y: number } {
    const x = e.pageX - (position.x || 0);
    const y = e.pageY - (position.y || 0);

    return { x, y };
  }

  function first(e: CanvasHTML) {
    const { x, y } = calc(e);
    setStart({ x, y });
    const line = {
      start,
      end: start,
    };
    setLineArr((prev: any) => [...prev, line]);

    draw();

    setTriger(true);
  }

  function intersect(
    x1: any,
    y1: any,
    x2: any,
    y2: any,
    x3: any,
    y3: any,
    x4: any,
    y4: any,
  ) {
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }

    let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Lines are parallel
    if (denominator === 0) {
      return false;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    return { x, y };
  }
  function last(e: CanvasHTML) {
    setTriger(false);
    setDrawTriger(false);
    const line = calc(e);
    if (ctx) {
      const allDot = [...dotA, ...dot];

      setDot(allDot);
      grafiti(allDot);
    }
    setEnd(line);
  }

  function handlClick(e: CanvasHTML): void {
    console.log(e);

    if (!triger) {
      first(e);
      return;
    }
    last(e);
  }

  function clearLine() {
    ctx?.clearRect(0, 0, 30001, 30001);
  }

  function grafiti(arg: any): void {
    if (ctx) {
      arg.forEach((e: any) => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 5, 0, Math.PI * 2, true);
        ctx.fillStyle = 'red';

        ctx.fill('evenodd');
      });
    }
  }

  function handlMove(e: CanvasHTML): void {
    if (triger) {
      const { x, y } = calc(e);
      setEnd({ x, y });

      const line = {
        start,
        end: { x, y },
      };

      const newArr = lineArr;
      newArr.pop();
      newArr.push(line);
      setLineArr(newArr);
      clearLine();
      draw();

      if (!drawTrig) {
        if (ctx) {
          const allDot = [...dotA, ...dot];
          grafiti(allDot);
        }
      }
      //цятка
      if (lineArr.length > 1) {
        if (ctx) {
          const result = newArr.reduce((acc: any[], el: any) => {
            const helper = intersect(
              el.start.x,
              el.start.y,
              el.end.x,
              el.end.y,
              line.start.x,
              line.start.y,
              line.end.x,
              line.end.y,
            );
            if (helper) {
              acc.push(helper);
            }
            return acc;
          }, []);

          if (result.length > 0) {
            setDrawTriger(true);
            const allDot = [...result, ...dot];
            setDotA(result);
            grafiti(allDot);
          }
          setDotA(result);
        }
      }
    }
  }

  function rightClick(e: any): void {
    e.preventDefault();
    if (drawTrig) {
      const newArr = lineArr;
    newArr.pop();
    setLineArr(newArr);
    clearLine();
    draw();
    grafiti(dot);
    setDrawTriger(false);
    setTriger(!triger);
 }
  }

  function clearBut(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
    setLineArr([]);
    setDot([]);
    setDotA([]);
    ctx?.clearRect(0, 0, 33333, 33333);
  }
  return (
    <div className={s.Canvas}>
      <canvas
        onMouseMove={handlMove}
        onClick={handlClick}
        onContextMenu={rightClick}
        ref={mass}
        width={1300}
        height={700}
      />
      <button onClick={clearBut}>Click me please</button>
    </div>
  );
};

export default Canvas;
