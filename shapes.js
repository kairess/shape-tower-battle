import { Bodies, Body, Vertices } from 'matter-js';

const commonOptions = {
  friction: 1,
  frictionStatic: 10,
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

// 반원 생성 함수
function createSemiCircle(x, y, radius) {
  const semiCircle = Bodies.circle(x, y, radius, {
    ...commonOptions,
    render: {
      fillStyle: 'green'
    }
  }, 64);
  
  Body.setVertices(semiCircle, Vertices.create([
    { x: -radius, y: 0 },
    ...semiCircle.vertices.filter(v => v.y <= 0),
    { x: radius, y: 0 }
  ], semiCircle.position));
  
  return semiCircle;
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
  const heartShape = Vertices.fromPath(`
    ${size * 0} ${size * -0.5}
    ${size * 0.5} ${size * -0.25}
    ${size * 0.25} ${size * 0.25}
    ${size * 0} ${size * 0.5}
    ${size * -0.25} ${size * 0.25}
    ${size * -0.5} ${size * -0.25}
  `);
  
  return Bodies.fromVertices(x, y, heartShape, {
    ...commonOptions,
    render: {
      fillStyle: 'pink'
    }
  });
}

const shapes = {
  'star': createStar,
  'triangle': createTriangle,
  'hexagon': createHexagon,
  'semiCircle': createSemiCircle,
  'cross': createCross,
  'heart': createHeart,
};

export { shapes };
