import { Bodies, Body, Vertices } from 'matter-js';

const commonOptions = {
  friction: 10,
  frictionStatic: 100,
  restitution: 0,
};

// 별 모양 생성 함수
function createStar(x, y, outerRadius) {
  const vertices = [];
  const angle = Math.PI * 2 / 5;

  for (let i = 0; i < 5 * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : outerRadius / 2;
    vertices.push({
      x: x + radius * Math.cos(i * angle / 2 - Math.PI / 2),
      y: y + radius * Math.sin(i * angle / 2 - Math.PI / 2)
    });
  }

  return Bodies.fromVertices(x, y, [vertices], {
    ...commonOptions,
    render: {
      fillStyle: 'yellow'
    }
  });
}

// 삼각형 생성 함수
function createTriangle(x, y, size) {
  return Bodies.polygon(x, y, 3, size, {
    ...commonOptions,
    render: {
      fillStyle: 'red'
    }
  });
}

// 육각형 생성 함수
function createHexagon(x, y, size) {
  return Bodies.polygon(x, y, 6, size, {
    ...commonOptions,
    render: {
      fillStyle: 'purple'
    }
  });
}

// 십자가 생성 함수
function createCross(x, y, size) {
  const thickness = size / 3;
  const cross = Bodies.rectangle(x, y, size, thickness, {});
  const verticalPart = Bodies.rectangle(x, y, thickness, size, {});
  
  return Body.create({
    parts: [cross, verticalPart],
    ...commonOptions,
    render: {
      fillStyle: 'blue'
    }
  });
}

// 하트 모양 생성 함수
function createHeart(x, y, size) {
  const heartVertices = [
    { x: size * 0.5, y: size * 0.2 },
    { x: size * 0.35, y: size * 0.05 },
    { x: size * 0.2, y: size * 0.05 },
    { x: size * 0.05, y: size * 0.3 },
    { x: size * 0.05, y: size * 0.5 },
    { x: size * 0.2, y: size * 0.75 },
    { x: size * 0.3, y: size * 0.9 },
    { x: size * 0.5, y: size * 1.2 },
    { x: size * 0.7, y: size * 0.9 },
    { x: size * 0.8, y: size * 0.75 },
    { x: size * 0.95, y: size * 0.5 },
    { x: size * 0.95, y: size * 0.3 },
    { x: size * 0.8, y: size * 0.05 },
    { x: size * 0.65, y: size * 0.05 },
  ];
  
  return Bodies.fromVertices(x, y, [heartVertices], {
    ...commonOptions,
    render: {
      fillStyle: 'red'
    }
  });
}

const shapes = {
  'star': createStar,
  'triangle': createTriangle,
  'hexagon': createHexagon,
  'cross': createCross,
  'heart': createHeart,
};

export { shapes };
