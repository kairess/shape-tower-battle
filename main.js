import { Engine, Render, World, Bodies, Body, Runner, Composite } from "matter-js";
import { shapes } from './shapes.js';

const gameWidth = 1000;
const gameHeight = 800;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: gameWidth,
    height: gameHeight,
    background: '#87CEEB',
    wireframes: false,
    showCollisions: true,
  }
});

const ground = Bodies.rectangle(gameWidth / 2, gameHeight - 80, gameWidth / 2, 30, {
  isStatic: true,
  render: {
    fillStyle: 'green',
  },
  friction: 1,
  frictionStatic: 10,
  restitution: 0,
});

World.add(world, ground);

let currentShapeBody = null;
let isGameOver = false;

function createShape() {
  const shapeName = Object.keys(shapes)[Math.floor(Math.random() * Object.keys(shapes).length)];
  console.log(shapeName);
  const size = Math.floor(Math.random() * 50) + 50;
  const shape = shapes[shapeName](0, 0, size);

  Body.setStatic(shape, true);
  Body.setPosition(shape, { x: gameWidth / 2, y: 100 });
  Body.setAngle(shape, Math.random() * Math.PI);

  World.add(world, [shape]);
  currentShapeBody = shape;
}

function dropShape() {
  Body.setStatic(currentShapeBody, false);

  // 도형이 멈출 때까지 기다린 후 새 도형 생성
  const checkStopped = () => {
    if (currentShapeBody.speed < 0.1) {
      createShape();
    } else {
      setTimeout(checkStopped, 100);
    }
  };
  
  setTimeout(checkStopped, 1000); // 1초 후부터 체크 시작
}

// 키보드 이벤트 리스너 수정
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyQ':
      Body.rotate(currentShapeBody, -0.1);
      break;
    case 'KeyE':
      Body.rotate(currentShapeBody, 0.1);
      break;
    case 'KeyA':
      Body.translate(currentShapeBody, { x: -10, y: 0 });
      break;
    case 'KeyD':
      Body.translate(currentShapeBody, { x: 10, y: 0 });
      break;
    case 'Space':
      dropShape();
      break;
  }
});

function checkGameOver() {
  const bodies = Composite.allBodies(engine.world);
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body !== ground && body.position.y > gameHeight + 100) {
      isGameOver = true;
      return alert('YOU DIED');
    }
  }
}

// 게임 루프 수정
(function gameLoop() {
  if (!isGameOver) {
    checkGameOver();
    requestAnimationFrame(gameLoop);
  }
})();

// 게임 시작 시 첫 번째 도형 생성
createShape();

// 엔진 및 렌더러 실행
const runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);
