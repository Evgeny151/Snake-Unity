const game = document.getElementById("game");

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

const segmentsAngles = new Array(snake.length).fill(0);

// First derection to the right
let direction = { x: 1, y: 0 };

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

function getSegmentType(i) {
  if (i === 0) return "head";
  if (i === snake.length - 1) return "tail";

  const prev = snake[i - 1];
  const curr = snake[i];
  const next = snake[i + 1];

  const dx1 = curr.x - prev.x;
  const dy1 = curr.y - prev.y;
  const dx2 = next.x - curr.x;
  const dy2 = next.y - curr.y;

  if (dx1 === dx2 && dy1 === dy2) return "body";

  return "turn"; // Rotation!
}

function getShortestAngle(from, to) {
  // Нормализуем углы в диапазон [0, 360)
  const normalizedFrom = from % 360;
  const normalizedTo = to % 360;

  let diff = (normalizedTo - normalizedFrom + 360) % 360;
  if (diff > 180) diff -= 360;

  // Добавляем к исходному `from`, чтобы сохранить направление и плавность
  return from + diff;
}

function setTurnClass(segment, dx1, dy1, dx2, dy2) {
  if (dx1 === 0 && dy1 === -1 && dx2 === 1 && dy2 === 0) {// слева вниз
    segment.classList.add("turn-bottom-left");
  } else if (dx1 === -1 && dy1 === 0 && dx2 === 0 && dy2 === 1) {// сверху - направо
    segment.classList.add("turn-top-left");
  } else if (dx1 === 1 && dy1 === 0 && dx2 === 0 && dy2 === 1) { // сверху - влево
    segment.classList.add("turn-top-right");
  } else if (dx1 === 0 && dy1 === 1 && dx2 === -1 && dy2 === 0) { // справа наверх
    segment.classList.add("turn-bottom-right");
  } else if (dx1 === 0 && dy1 === -1 && dx2 === -1 && dy2 === 0) { // справа вниз
    segment.classList.add("turn-top-right");
  } else if (dx1 === 1 && dy1 === 0 && dx2 === 0 && dy2 === -1) {// снизу влево
    segment.classList.add("turn-top-left");
  } else if (dx1 === 0 && dy1 === 1 && dx2 === 1 && dy2 === 0) { // слева наверх
    segment.classList.add("turn-bottom-left");
  } else { // снизу направо
    segment.classList.add("turn-bottom-left");
  }
}

// Field painting
function render(oldHeadX, oldHeadY) {
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

    snakeElements[i].style.transform = `translate(${current.x * cellSize}px, ${
      current.y * cellSize
    }px) rotate(${smoothAngle}deg)`;

    const segmentType = getSegmentType(i);
    snakeElements[i].className = "snakeSegment"; // сбрасываем все классы

    if (segmentType === "turn") {
      const prev = snake[i - 1];
      const curr = snake[i];
      const next = snake[i + 1];

      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      // setTurnClass(snakeElements[i], dx1, dy1, dx2, dy2)
    }
  });

  foodElement.style.transform = `translate(${food.x * cellSize}px, ${
    food.y * cellSize
  }px)`;
}

function move() {
  const oldHeadX = snake[0].x;
  const oldHeadY = snake[0].y;

  const nextX = snake[0].x + direction.x;
  const nextY = snake[0].y + direction.y;

  if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) {
    console.log("Game Over!!!!!!!!!!!!!");
    clearInterval(intervalId);
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

  console.log("snake", snake);

  if (isCollision()) {
    console.log("Collised Game over!");
    return clearInterval(intervalId);
  }

  render(oldHeadX, oldHeadY);
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
      if (direction.y !== 1) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y !== -1) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x !== 1) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x !== -1) direction = { x: 1, y: 0 };
      break;
  }
});

const intervalId = setInterval(move, 200);
