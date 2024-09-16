import { Engine, Render, World, Bodies, Body, Runner, Composite, Common, Vertices } from "matter-js";

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

let currentAnimalBody = null;
let isGameOver = false;

async function loadPathsFromJson(jsonFile) {
  const response = await fetch(jsonFile);
  const data = await response.json();
  return data.paths;
}

async function createBodyFromJsonPath(jsonFile, scale, imagePath) {
  const paths = await loadPathsFromJson(jsonFile);
  const vertexSets = paths.map(path => {
    return Vertices.scale(path, scale, scale);
  });

  const body = Bodies.fromVertices(0, 0, vertexSets, {
    render: {
      sprite: {
        texture: imagePath,
        xScale: scale,
        yScale: scale
      }
    },
    isSleeping: true,
    friction: 1,
    frictionStatic: 10,
    restitution: 0.1
  }, true);

  return body;
}

const animals = [
  { name: 'giraffe', jsonPath: 'assets/giraffe.json', imagePath: 'assets/giraffe.png' },
  // { name: 'girl', jsonPath: 'assets/girl.json', imagePath: 'assets/girl.png' },
];

function createAndPositionAnimal() {
  const randomIndex = Math.floor(Math.random() * animals.length);
  const animal = animals[randomIndex];
  createBodyFromJsonPath(animal.jsonPath, 0.15, animal.imagePath).then(animalBody => {
    Body.setPosition(animalBody, { x: gameWidth / 2, y: 100 });
    World.add(world, animalBody);
    currentAnimalBody = animalBody;
  });
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