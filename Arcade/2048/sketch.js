let grid = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
let moved = false;
let gameWon = false;
let gameOver = false;
let showTitleScreen = true; // Track if title screen is shown
let tileSize = 100;
let padding = 10;
let score = 0;

let titleImage;  // Declare title image variable

function preload() {
  titleImage = loadImage("assets/2048title.png");  // Load the title image
}

function setup() {
  createCanvas(450, 500);
  resetGame();
}

function draw() {
  if (showTitleScreen) {
    image(titleImage, 0, 0, width, height);  // Display the title screen
  } else {
    background(187, 173, 160);
    drawGrid();
    drawScore();

    if (gameWon) {
      displayMessage("You Won! Press SPACE to Restart");
    } else if (gameOver) {
      displayMessage("Game Over! Press SPACE to Restart");
    }
  }
}

function resetGame() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      grid[i][j] = 0;
    }
  }
  score = 0;
  addRandomTile();
  addRandomTile();
  gameWon = false;
  gameOver = false;
  loop();
}

function drawGrid() {
  textAlign(CENTER, CENTER);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let value = grid[i][j];
      fill(getTileColor(value));
      rect(j * (tileSize + padding) + padding, i * (tileSize + padding) + padding, tileSize, tileSize);
      if (value != 0) {
        fill(0);
        textSize(32);
        text(value, j * (tileSize + padding) + tileSize / 2 + padding, i * (tileSize + padding) + tileSize / 2 + padding);
      }
    }
  }
}

function drawScore() {
  fill(0);
  textAlign(CENTER);
  textSize(24);
  text("Score: " + score, width / 2, height - 15);
}

function displayMessage(message) {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text(message, width / 2, height - 40);
  noLoop();
}

function getTileColor(value) {
  switch (value) {
    case 2: return color(238, 228, 218);
    case 4: return color(237, 224, 200);
    case 8: return color(242, 177, 121);
    case 16: return color(245, 149, 99);
    case 32: return color(246, 124, 95);
    case 64: return color(246, 94, 59);
    case 128: return color(237, 207, 114);
    case 256: return color(237, 204, 97);
    case 512: return color(237, 200, 80);
    case 1024: return color(237, 197, 63);
    case 2048: return color(237, 194, 46);
    default: return color(205, 193, 180);
  }
}

function keyPressed() {
  if (showTitleScreen) {
    if (key == ' ') {
      showTitleScreen = false;  // Remove title screen after spacebar is pressed
    }
    return;
  }

  if (gameWon || gameOver) {
    if (key == ' ') {
      resetGame();  // Reset the game when spacebar is pressed
    }
    return;
  }

  if (keyCode === UP_ARROW) {
    moved = moveUp();
  } else if (keyCode === DOWN_ARROW) {
    moved = moveDown();
  } else if (keyCode === LEFT_ARROW) {
    moved = moveLeft();
  } else if (keyCode === RIGHT_ARROW) {
    moved = moveRight();
  }

  if (moved) {
    addRandomTile();
    checkGameState();
  }
}

function addRandomTile() {
  let emptySpaces = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 2048) {
        gameWon = true;
      }
      if (grid[i][j] === 0) {
        emptySpaces.push(createVector(i, j));
      }
    }
  }

  if (!gameWon && emptySpaces.length > 0) {
    let index = floor(random(emptySpaces.length));
    let pos = emptySpaces[index];
    grid[pos.x][pos.y] = random(1) < 0.9 ? 2 : 4;
    updateScore();
  }
}

function updateScore() {
  score = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      score += grid[i][j];
    }
  }
}

function checkGameState() {
  if (!hasMovesLeft()) {
    gameOver = true;
  }
}

function moveUp() {
  return moveAndMergeGrid(0, 1);
}

function moveDown() {
  return moveAndMergeGrid(0, -1);
}

function moveLeft() {
  return moveAndMergeGrid(1, 1);
}

function moveRight() {
  return moveAndMergeGrid(1, -1);
}

function moveAndMergeGrid(direction, step) {
  let moved = false;
  for (let i = 0; i < 4; i++) {
    let line = [0, 0, 0, 0];
    if (direction === 0) {
      for (let j = 0; j < 4; j++) {
        line[j] = grid[j][i];
      }
    } else {
      line = grid[i].slice();
    }

    if (step === -1) {
      qReverse(line);
    }

    let newLine = merge(line);

    if (step === -1) {
      qReverse(newLine);
    }

    if (direction === 0) {
      for (let j = 0; j < 4; j++) {
        if (grid[j][i] !== newLine[j]) {
          moved = true;
        }
        grid[j][i] = newLine[j];
      }
    } else {
      if (!arraysEqual(grid[i], newLine)) {
        moved = true;
      }
      grid[i] = newLine;
    }
  }
  return moved;
}

function merge(line) {
  let result = [];
  let merged = false;
  for (let i = 0; i < 4; i++) {
    if (line[i] !== 0) {
      if (result.length > 0 && result[result.length - 1] === line[i] && !merged) {
        result[result.length - 1] *= 2;
        merged = true;
      } else {
        result.push(line[i]);
        merged = false;
      }
    }
  }
  while (result.length < 4) {
    result.push(0);
  }
  return result;
}

function hasMovesLeft() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return true;
      if (i < 3 && grid[i][j] === grid[i + 1][j]) return true;
      if (j < 3 && grid[i][j] === grid[i][j + 1]) return true;
    }
  }
  return false;
}

function qReverse(arr) {
  for (let i = 0; i < arr.length / 2; i++) {
    let temp = arr[i];
    arr[i] = arr[arr.length - i - 1];
    arr[arr.length - i - 1] = temp;
  }
}

function arraysEqual(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}
