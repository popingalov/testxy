import { useRef, useEffect, useState } from 'react';
import s from './Canvas.module.scss';
// import throttle from 'lodash.throttle';
interface CanvasProps {
  (): JSX.Element;
}

type CanvasHTML = React.MouseEvent<HTMLCanvasElement>;
type Canva = CanvasRenderingContext2D | null | undefined;

interface Obj {
  start: { x: number; y: number };
  end: { x: number; y: number };
}
type TlineAr = Obj[];

interface Tpos {
  x: number;
  y: number;
}

interface Dot {
  x: number;
  y: number;
}
type Tdot = Dot[];

const Canvas: CanvasProps = () => {
  let mass = useRef<HTMLCanvasElement>(null);
  const ctx: Canva = mass.current?.getContext('2d');
  const [position, setPosition] = useState<Tpos>({ x: 0, y: 0 });
  const [start, setStart] = useState<Tpos>({ x: 0, y: 0 });
  const [triger, setTriger] = useState<boolean>(false);
  const [lineArr, setLineArr] = useState<TlineAr>([]);
  const [dot, setDot] = useState<Tdot>([]);
  const [dotA, setDotA] = useState<Tdot>([]);
  const [drawTrig, setDrawTriger] = useState(false);
  const [animationTriger, setAnimationTriger] = useState(false);
  const [width, setWidth] = useState(0);
  const [heigth, setHeigth] = useState(0);

  useEffect(() => {
    setTriger(false);
    setWidth(window.innerWidth - 127);
    setHeigth(window.innerHeight - window.innerHeight * 0.2);
    setTimeout(() => {
      if (mass.current) {
        setPosition({
          y: mass.current?.offsetTop,
          x: mass.current?.offsetLeft,
        });
      }
    });
  }, []);

  function draw(el = lineArr): void {
    console.log(ctx);
    
    el.forEach(e => {
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
    setLineArr(prev => [...prev, line]);

    draw();

    setTriger(true);
  }

  function intersect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
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
    if (ctx) {
      const allDot = [...dotA, ...dot];

      setDot(allDot);
      grafiti(allDot);
    }
  }

  function handlClick(e: CanvasHTML): void {
    if (animationTriger) return;
    if (!triger) {
      first(e);
      return;
    }
    last(e);
  }

  function clearLine() {
    ctx?.clearRect(0, 0, 30001, 30001);
  }

  function grafiti(arg: Tpos[]) {
    if (ctx) {
      arg.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 5, 0, Math.PI * 2, true);
        ctx.fillStyle = 'red';
        ctx.fill('evenodd');
      });
    }
  }

  function handlMove(e: CanvasHTML) {
    if (triger) {
      const { x, y } = calc(e);

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
          const result = newArr.reduce((acc: Tpos[], el) => {
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
            return;
          }
          setDotA(result);
          grafiti(dot);
        }
      }
    }
  }

  function rightClick(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    e.preventDefault();
    if (triger) {
      const newArr = lineArr;
      newArr.pop();
      setLineArr(newArr);
      clearLine();
      draw();
      setDotA([])
      grafiti(dot);
      setDrawTriger(false);
      setTriger(!triger);
    }
  }

  function helperClac(el: Obj) {
    const balanseX = (el.start.x + el.end.x) / 2;
    const balanseY = (el.start.y + el.end.y) / 2;

    const helperXS = el.start.x + (balanseX - el.start.x) * 0.1;
    const helperYS = el.start.y + (balanseY - el.start.y) * 0.1;

    const helperXE = el.end.x + (balanseX - el.end.x) * 0.1;
    const helperYE = el.end.y + (balanseY - el.end.y) * 0.1;

    const result = {
      start: { x: helperXS, y: helperYS },
      end: { x: helperXE, y: helperYE },
    };
    return result;
  }

  function clearBut(e: React.MouseEvent<HTMLButtonElement>) {
    setAnimationTriger(true);

    e.preventDefault();
    (function loops(el: any, triger: number) {
      if (triger <= 0) {
        return;
      }
      let newTriger = triger - 200;
      const helper = el.line || el;
      setTimeout(() => {
        const red = helper.reduce(
          (acc: { line: Obj[]; dots: Tpos[] }, el: Obj) => {
            const { start, end } = helperClac(el);

            acc.line.push({
              start,
              end,
            });

            helper.reduce((_: Tpos[], ell: Obj) => {
              const helper = intersect(
                ell.start.x,
                ell.start.y,
                ell.end.x,
                ell.end.y,
                el.start.x,
                el.start.y,
                el.end.x,
                el.end.y,
              );

              if (helper) {
                acc.dots.push(helper);
              }
              return acc;
            }, []);
            // if (result.length > 0) acc.dots.push(result);

            return acc;
          },
          { line: [], dots: [] },
        );
        setLineArr(red);
        clearLine();
        grafiti(red.dots);
        draw(red.line);
        loops(red, newTriger);
      }, 65);
    })(lineArr, 10000);

    setTimeout(() => {
      setLineArr([]);
      setDot([]);
      setDotA([]);
      setAnimationTriger(false);
      ctx?.clearRect(0, 0, 33333, 33333);
    }, 4000);
  }
  return (
    <div className={s.box}>
      <div className={s.Canvas}>
        <canvas
          onMouseMove={handlMove}
          onClick={handlClick}
          onContextMenu={rightClick}
          ref={mass}
          width={width}
          height={heigth}
          className={s.Canvass}
        />
      </div>
      <button onClick={clearBut}>Click me please</button>
    </div>
  );
};

export default Canvas;
