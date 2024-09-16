import { Engine, Render, World, Bodies, Body, Runner, Composite, Common, Vertices } from "matter-js";
// import decomp from 'poly-decomp';
// Common.setDecomp(decomp);

const gameWidth = 800;
const gameHeight = 700;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: gameWidth,
    height: gameHeight,
    background: '#87CEEB',
    wireframes: true,
  }
});

const ground = Bodies.rectangle(gameWidth / 2, gameHeight - 100, gameWidth / 2, 60, {
  isStatic: true,
  render: { sprite: {
    texture: 'assets/platform.png',
    xScale: 0.5,
    yScale: 0.5,
  }},
  friction: 1,
  frictionStatic: 10,
});
World.add(world, ground);

const animals = [
  { name: 'giraffe', path: 'assets/giraffe.png' },
  { name: 'girl', path: 'assets/girl.png' },
];

let currentAnimal = 0;
let currentAnimalBody = null;
let isGameOver = false;

function createBodyFromPNG(imageUrl, scale) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const points = [];

      for (let y = 0; y < canvas.height; y+=10) {
        for (let x = 0; x < canvas.width; x+=10) {
          const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 0) {
            points.push({ x: x * scale, y: y * scale });
          }
        }
      }

      // const simplifiedPoints = simplifyContour(points, 20);
      // console.log(simplifiedPoints);

      const sortedPoints = Vertices.clockwiseSort(points);
      const body = Bodies.fromVertices(0, 0, [sortedPoints], {
        render: {
          sprite: {
            texture: imageUrl,
            xScale: scale,
            yScale: scale
          }
        },
        isSleeping: true,
        friction: 1,        // 마찰력 증가
        frictionStatic: 10,  // 정지 마찰력 증가
        restitution: 0.1      // 반발력 감소
      });

      resolve(body);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}


function simplifyContour(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const distance = pointLineDistance(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > tolerance) {
    const results1 = simplifyContour(points.slice(0, index + 1), tolerance);
    const results2 = simplifyContour(points.slice(index), tolerance);

    return [...results1.slice(0, -1), ...results2];
  } else {
    return [points[0], points[end]];
  }
}

function pointLineDistance(point, lineStart, lineEnd) {
  const numerator = Math.abs(
    (lineEnd.y - lineStart.y) * point.x -
    (lineEnd.x - lineStart.x) * point.y +
    lineEnd.x * lineStart.y -
    lineEnd.y * lineStart.x
  );
  const denominator = Math.sqrt(
    Math.pow(lineEnd.y - lineStart.y, 2) +
    Math.pow(lineEnd.x - lineStart.x, 2)
  );
  return numerator / denominator;
}

// 키보드 이벤트 리스너 수정
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      Body.rotate(currentAnimalBody, -0.1);
      break;
    case 'KeyD':
      Body.rotate(currentAnimalBody, 0.1);
      break;
    case 'ArrowLeft':
      Body.translate(currentAnimalBody, { x: -10, y: 0 });
      break;
    case 'ArrowRight':
      Body.translate(currentAnimalBody, { x: 10, y: 0 });
      break;
    case 'Space':
      dropAnimal();
      break;
  }
});

function createAndPositionAnimal() {
  const randomIndex = Math.floor(Math.random() * animals.length);
  const animal = animals[randomIndex];
  createBodyFromPNG(animal.path, 0.15).then(animalBody => {
    Body.setPosition(animalBody, { x: gameWidth / 2, y: 100 });
    World.add(world, animalBody);
    currentAnimalBody = animalBody;
  })
}

function dropAnimal() {
  currentAnimalBody.isSleeping = false;
  
  // 동물이 멈출 때까지 기다린 후 새 동물 생성
  const checkStopped = () => {
    if (currentAnimalBody.speed < 0.1) {
      createAndPositionAnimal();
    } else {
      setTimeout(checkStopped, 100);
    }
  };
  
  setTimeout(checkStopped, 1000); // 1초 후부터 체크 시작
}

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

// 게임 시작 시 첫 번째 동물 생성
createAndPositionAnimal();

// 엔진 및 렌더러 실행
const runner = Runner.create();
Runner.run(runner, engine);
Render.run(render);