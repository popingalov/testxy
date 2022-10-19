import { Component} from 'react';
import s from './Canvas.module.scss';
// import throttle from 'lodash.throttle';
// interface CanvasProps {
//   (): JSX.Element;
// }

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

// interface Comp {
//   P: any;
//   S: any;
//   SS: Readonly<Comp>;
// }

type Test = any;
class Canvas extends Component<Test> {
state = {
    ctx: null,
    position: { x: 0, y: 0 },
    triger: false,
    width: 0,
    heigth: 0,
    lineArr: [],
    start: { x: 0, y: 0 },
    dot: [],
    dotA: [],
    drawTrig: false,
    animationTriger: false,
  };

  get ctx(): Canva {
    return this.state.ctx;
  }

  // set ctx(arg) {
  //   this.ctx = arg;
  // }
  get position() {
    return this.state.position;
  }

  set position(arg) {
    this.setState({ position: arg });
  }
  get triger() {
    return this.state.triger;
  }

  set triger(arg) {
    this.setState({ triger: arg });
  }
  get width() {
    return this.state.width;
  }

  set width(arg) {
    this.setState({ width: arg });
  }
  get heigth() {
    return this.state.heigth;
  }

  set heigth(arg:number) {
    this.setState({ heigth: arg });
  }
  get lineArr() {
    return this.state.lineArr;
  }

  set lineArr(arg: TlineAr) {
    this.setState({ lineArr: arg });
  }
  get start() {
    return this.state.start;
  }

  set start(arg) {
    this.setState({ start: arg });
  }
  get animationTriger() {
    return this.state.animationTriger;
  }

  set animationTriger(arg:boolean) {
    this.setState({ animationTriger: arg });
  }
  get dot() {
    return this.state.dot;
  }

  set dot(arg: Tdot) {
    this.setState({ dot: arg });
  }
  get dotA() {
    return this.state.dotA;
  }

  set dotA(arg: Tdot) {
    this.setState({ dotA: arg });
  }
  get drawTrig() {
    return this.state.drawTrig;
  }

  set drawTrig(arg:boolean) {
    this.setState({ drawTrig: arg });
  }

  
  componentDidMount(): void {
    const refa = document.getElementsByTagName('canvas')[0];
    const newCtx = refa.getContext('2d');
    setTimeout(() => {
      this.setState({
      ctx: newCtx,
      position: { y: refa.offsetTop, x: refa.offsetTop },
      triger: false,
      width: window.innerWidth - 127,
      heigth: window.innerHeight - window.innerHeight * 0.2,
    });
 },1)
  }

  draw = (el = this.state.lineArr): void => {
    const { ctx } = this;
    
    el.forEach(e => {
      this.drawLine(ctx, e);
    });
  };



  drawLine = (ctx: Canva, line: Obj): void => {
    const { start, end } = line;
    if (ctx) {
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  calc = (e: CanvasHTML): { x: number; y: number } => {
    const { position } = this;
    const x = e.pageX - (position.x || 0);
    const y = e.pageY - (position.y || 0);

    return { x, y };
  };

  first = (e: CanvasHTML) => {
    const { x, y } = this.calc(e);
    const { start } = this;
    this.start = { x, y };

    const line = {
      start,
      end: start,
    };

    this.lineArr = [...this.lineArr, line];

    this.draw();
    this.triger = true;
  };

  intersect = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
  ) => {
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
  };

  last = (e: CanvasHTML) => {
    const { ctx, dotA, dot, grafiti } = this;
    this.triger = false;
    this.drawTrig = false;
    if (ctx) {
      const allDot = [...dotA, ...dot];

      this.dot = allDot;
      grafiti(allDot);
    }
  };

  handlClick = (e: CanvasHTML): void => {
    const { animationTriger, triger, first, last } = this;

    if (animationTriger) return;
    if (!triger) {
      first(e);
      return;
    }
    last(e);
  };

  clearLine = () => {
    this.ctx?.clearRect(0, 0, 30001, 30001);
  };

  grafiti = (arg: Tpos[]) => {
    const { ctx } = this;
    if (ctx) {
      arg.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 5, 0, Math.PI * 2, true);
        ctx.fillStyle = 'red';
        ctx.fill('evenodd');
      });
    }
  };

  handlMove = (e: CanvasHTML) => {
    const {
      triger,
      calc,
      start,
      lineArr,
      clearLine,
      draw,
      drawTrig,
      ctx,
      dotA,
      dot,
      grafiti,
      intersect,
    } = this;
    if (triger) {
      const { x, y } = calc(e);

      const line = {
        start,
        end: { x, y },
      };

      const newArr = lineArr;
      newArr.pop();
      newArr.push(line);
      this.lineArr = newArr;
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
            this.drawTrig = true;
            const allDot = [...result, ...dot];

            this.dotA = result;
            grafiti(allDot);
            return;
          }
          this.dotA = result;
          grafiti(dot);
        }
      }
    }
  };

  rightClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const { triger, lineArr, clearLine, draw, dot, grafiti } = this;
    e.preventDefault();
    if (triger) {
      const newArr = lineArr;
      newArr.pop();
      this.lineArr = newArr;
      clearLine();
      draw();
      this.dotA = [];
      grafiti(dot);
      this.drawTrig = false;
      this.triger = !triger;
    }
  };

  helperClac = (el: Obj) => {
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
  };

  coloseAnimation = (el: any, triger: number) => {
       
      if (triger <= 0) {
        return;
      }
    const { clearLine, helperClac, intersect,grafiti,draw ,coloseAnimation} = this
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

        this.lineArr = red;
    

        clearLine();
        grafiti(red.dots);
        draw(red.line);
        coloseAnimation(red, newTriger);
      }, 60);
    };

  clearBut = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { coloseAnimation,lineArr} = this;
    this.animationTriger = true;
    e.preventDefault();

    coloseAnimation(lineArr,8000)

    setTimeout(() => {
      this.lineArr = [];
      this.dot = [];
      this.dotA = [];
      this.animationTriger = false;
      this.clearLine();
    }, 3100);
  };
  render() {
    const { width, heigth } = this.state;
    const { handlMove, handlClick, rightClick ,clearBut} = this;
    return (
      <div className={s.box}>
        <div className={s.Canvas}>
          <canvas
            onMouseMove={handlMove}
            onClick={handlClick}
            onContextMenu={rightClick}
            // ref={setRef}
            width={width}
            height={heigth}
            className={s.Canvass}
          />
        </div>
        <button onClick={clearBut}>Click me please</button>
      </div>
    );
  }
}

export default Canvas;
