const game = document.getElementById("game");

let running = true;

const rows = 20;
const cols = 20;
const cellSize = 20;

let angle = 0;

// Snake Initialization
let snake = [
  { x: 5, y: 5 }, // head
  { x: 4, y: 5 },
  { x: 3, y: 5 }, // tail
];

let previousSnake = JSON.parse(JSON.stringify(snake)) // копия для интерполяции

const segmentsAngles = new Array(snake.length).fill(0);

// First derection to the right
let direction = { x: 1, y: 0 };
let nextDirection = direction;

// Food
let food = { x: 10, y: 10 };

function createElement(element) {
  const el = document.createElement("div");
  el.classList.add(element);
  game.appendChild(el);
  return el;
}

const snakeElements = snake.map(() => createElement("snakeSegment"));
const foodElement = createElement("food");

function getShortestAngle(from, to) {
  // Нормализуем углы в диапазон [0, 360)
  const normalizedFrom = from % 360;
  const normalizedTo = to % 360;

  let diff = (normalizedTo - normalizedFrom + 360) % 360;
  if (diff > 180) diff -= 360;

  // Добавляем к исходному `from`, чтобы сохранить направление и плавность
  return from + diff;
}

// Field painting
// Только отрисовка
function render(alpha) {
  snake.forEach((current, i) => {
    const prev = previousSnake[i] || current;
    const interpX = prev.x + (current.x - prev.x) * alpha;
    const interpY = prev.y + (current.y - prev.y) * alpha;

    snakeElements[i].style.transform = `translate(${interpX * cellSize}px, ${interpY * cellSize}px) rotate(${segmentsAngles[i]}deg)`;
  });

  foodElement.style.transform = `translate(${food.x * cellSize}px, ${
    food.y * cellSize
  }px)`;
}

function move() {
  previousSnake = JSON.parse(JSON.stringify(snake)); // сохраняем прошлое положение перед шагом
  direction = nextDirection;
  
  const oldHeadX = snake[0].x;
  const oldHeadY = snake[0].y;

  const nextX = snake[0].x + direction.x;
  const nextY = snake[0].y + direction.y;

  if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) {
    console.log("Game Over!!!!!!!!!!!!!");
    running = false
    return;
  }

  const newHead = {
    x: nextX,
    y: nextY,
  };

  // Add new head
  snake.unshift(newHead);
  segmentsAngles.unshift(segmentsAngles[0] || 0);

  // check of meeting food
  if (newHead.x === food.x && newHead.y === food.y) {
    generateFood();
    const newSnakeSegment = createElement("snakeSegment");
    snakeElements.push(newSnakeSegment);
    segmentsAngles.push(segmentsAngles.length - 1);
  } else {
    snake.pop();
    segmentsAngles.pop();
  }

  if (isCollision()) {
    console.log("Collised Game over!");
    running = false
    return
  }

  snake.forEach((current, i) => {
    const next = snake[i - 1] || { x: oldHeadX, y: oldHeadY };
    const hasPrev = !!snake[i - 1];

    const dx = !hasPrev ? current.x - next.x : next.x - current.x;
    const dy = !hasPrev ? current.y - next.y : next.y - current.y;

    const isRightDirection = dx === 1 && dy === 0;
    const isDownDirection = dx === 0 && dy === 1;
    const isLeftDirection = dx === -1 && dy === 0;
    const isUpDirection = dx === 0 && dy === -1;

    if (isRightDirection) {
      angle = 0;
    } else if (isDownDirection) {
      angle = 90;
    } else if (isLeftDirection) {
      angle = 180;
    } else if (isUpDirection) {
      angle = 270;
    }

    const prevAngle = segmentsAngles[i];
    const smoothAngle = getShortestAngle(prevAngle, angle);
    segmentsAngles[i] = smoothAngle;
  });
}

function generateFood() {
  while (true) {
    food.x = Math.floor(Math.random() * cols);
    food.y = Math.floor(Math.random() * rows);

    const isOnSnake = snake.some(
      (part) => part.x === food.x && part.y === food.y
    );
    if (!isOnSnake) break;
  }
}

function isCollision() {
  const head = snake[0];
  const hitWall =
    snake[0].x < 0 ||
    snake[0].x === cols ||
    snake[0].y < 0 ||
    snake[0].y === rows;

  const hitSelf = snake
    .slice(1)
    .some((part) => head.x === part.x && head.y === part.y);

  return hitSelf || hitWall;
}

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }

  switch (event.key) {
    case "ArrowUp":
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
  }
});

// ----------- GAME LOOP WITH requestAnimationFrame -----------

let lastTime = 0 // хранит время предыдущего кадра в мс, чтобы замерить интервал между кадрами
let accumulator = 0 // суммирует прошедшее время между вызовами move(). Это нужно для компенсации разных FPS.
const snakeSpeed = 5 // скорость клетки/сек
const stepTime = 1 / snakeSpeed // Время, за которое змейка делает 1 шаг = 0.2 секунд

function gameLoop(timestamp) {
  if (!lastTime) {
    lastTime = timestamp // сохраняем текущее время для сравнения со следующим кадром
  }

  console.log('________start___________');
  
  
  const deltaTime = (timestamp - lastTime) / 1000 // сколько времени прошло с последнего кадра
  console.log('deltaTime', deltaTime);

    // 🐌 Симуляция задержки (например, имитировать падение FPS)
  const slowDown = false; // Включить/выключить замедление
  if (slowDown) {
    const start = performance.now();
    while (performance.now() - start < 100) {
      // Задержка 100 мс
      console.log('performance.now() - start = ', performance.now() - start);
    }
  }
  

  // Сколько времени прошло с момента последнего вызова move()
  // Даже если FPS плавает (например, от 30 до 60 кадров в секунду),
  // накопим ровно столько времени, сколько требуется для движения змейки.
  accumulator += deltaTime // накопление прошедшего времени 60 => 120 => 180 ...
  console.log('accumulator', accumulator);

  // while позволяет сделать несколько шагов за один кадр, если FPS сильно просел,
  // чтобы игра не тормозила
  while (accumulator >= stepTime && running) {
    console.log('----while---');
    
    move()
    accumulator -= stepTime
    console.log('accumulator', accumulator);
  }

  // Всегда вызывает render для плавной отрисовки
  const alpha = accumulator / stepTime; // коэффициент интерполяции
  render(alpha)

  lastTime = timestamp

  console.log('__________end______________');
  

  if (running) {
    requestAnimationFrame(gameLoop)
  }
}

generateFood()
requestAnimationFrame(gameLoop)
