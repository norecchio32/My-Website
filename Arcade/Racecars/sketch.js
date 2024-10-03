let balance = 1000; // Player's starting balance
let bets = [0, 0, 0, 0, 0]; // Array to hold bets on each car
let odds = [10, 5, 3, 2, 1.5]; // Multiplier odds for each car
let wins = [0, 0, 0, 0, 0]; // Track wins for each car
let totalRaces = 0; // Counter for total races played

let raceStarted = false;
let raceEnded = false;
let resultsProcessed = false; // Track if the race results have been processed
let titleScreen = true; // Track if we are on the title screen
let raceDuration = 5.0; // Race duration in seconds
let raceStartTime;

let carPositions = []; // Store car positions
let finishLine; // Position of the finish line

let laneMarkerX = []; // X position for lane markers for each car
let laneMarkerSpeed = 5; // Speed of lane marker movement
let carImages = []; // Array to store car images
let logo, titleImage;

function preload() {
  // Load images
  logo = loadImage("assets/racecarslogo.png");
  titleImage = loadImage("assets/racecartitle.png");
  for (let i = 0; i < 5; i++) {
    carImages[i] = loadImage("assets/car" + (i + 1) + ".png");
  }
}

function setup() {
  createCanvas(900, 600);
  finishLine = width - 100; // Finish line is set near the right side
  titleImage.resize(900, 600);

  resetCars();
}

function resetCars() {
  for (let i = 0; i < 5; i++) {
    carPositions[i] = createVector(150, (i + 1) * 100 - 20); // Initial car positions
    laneMarkerX[i] = 0; // Initialize lane marker positions
  }
}

function draw() {
  if (titleScreen) {
    // Draw title screen
    background(0);
    image(titleImage, 0, 0);
  } else {
    background(100, 200, 100);
    image(logo, width / 3.5, -160, 400, 400);
    textAlign(CENTER);
    textSize(20);
    text("Toggle Your Bets & Press SPACE to Start!", width / 2, height - 20);
    textAlign(LEFT);
    drawStreets(); // Draw dynamic streets
    drawInfoBoxes(); // Draw boxes around the betting info
    drawRace(); // Draw cars on top of the streets
    drawBettingButtons();
    drawBalance(); // Ensure the balance is displayed every frame
    drawRaceCounters(); // Draw the win counters for each car and total races
    drawClock(); // Draw the countdown timer

    if (raceStarted) {
      updateRace();
      if (millis() - raceStartTime > raceDuration * 1000) {
        endRace();
      }
    } else if (raceEnded) {
      displayResults(); // Ensure results are shown after the race ends
    }
  }
}

function drawRace() {
  // Draw checkerboard finish line to the left of the finish line
  let squareSize = 20;
  for (let y = 0; y < height; y += squareSize) {
    for (let x = -2 * squareSize; x < 0; x += squareSize) {
      fill((x / squareSize + y / squareSize) % 2 === 0 ? 0 : 255);
      rect(finishLine + x, y, squareSize, squareSize);
    }
  }

  // Label the finish line
  fill(0);
  textSize(20);
  text("Finish", finishLine + 10, 20);

  // Draw cars as images
  for (let i = 0; i < 5; i++) {
    image(carImages[i], carPositions[i].x - 10, carPositions[i].y, 100, 50);
  }
}

function drawBettingButtons() {
  textAlign(LEFT);
  for (let i = 0; i < 5; i++) {
    // Display +/- buttons for each car bet
    fill(200, 100, 100);
    rect(10, (i + 1) * 100 - 10, 30, 30); // '-' button
    fill(0, 200, 0);
    rect(40, (i + 1) * 100 - 10, 30, 30); // '+' button

    fill(0);
    textSize(20);
    text("-", 22, (i + 1) * 100 + 10); // '-' sign
    text("+", 51, (i + 1) * 100 + 12); // '+' sign

    // Display the current bet for the car
    textSize(16);
    text(`Car ${i + 1} Bet: $${bets[i]}`, 10, (i + 1) * 100 - 15);

    // Display the odds for each car
    text(`Pays ${odds[i]}x`, 75, (i + 1) * 100 + 10);
  }
}

function drawRaceCounters() {
  // Display total races
  fill(0);
  textSize(16);
  text(`Total Races: ${totalRaces}`, 10, 50);

  // Display win counters for each car
  for (let i = 0; i < 5; i++) {
    text(`Car ${i + 1} Wins: ${wins[i]}`, 10, (i + 1) * 100 + 40);
  }
}

function drawBalance() {
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text(`Balance: $${balance}`, 10, 30); // Display the updated balance
}

function updateRace() {
  for (let i = 0; i < 5; i++) {
    if (carPositions[i].x < finishLine) {
      let randomSpeed = 0;
      if (i === 4) randomSpeed = random(-1, 5.4); // Car 5 (Odds 1.5)
      else if (i === 3) randomSpeed = random(-1, 5.3); // Car 4 (Odds 2)
      else if (i === 2) randomSpeed = random(-1, 5.2); // Car 3 (Odds 3)
      else if (i === 1) randomSpeed = random(-1, 5.1); // Car 2 (Odds 5)
      else if (i === 0) randomSpeed = random(-1, 5.05); // Car 1 (Odds 10)

      carPositions[i].x += randomSpeed;
    }
  }
}

function endRace() {
  raceEnded = true;
  raceStarted = false;
  totalRaces++; // Increment race counter
}

function displayResults() {
  fill('#FFFECE');
  rect(318, 180, 300, 250);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Race Ended! Results:", width / 2, 200);
  textAlign(LEFT);

  let winner = false;

  if (!resultsProcessed) {
    for (let i = 0; i < 5; i++) {
      if (carPositions[i].x >= finishLine) {
        if (bets[i] > 0) {
          let payout = int(bets[i] * odds[i]); // Calculate payout
          balance += payout; // Add payout to balance
        }
        wins[i]++; // Increment win count
      }
    }
    resultsProcessed = true; // Mark results as processed
  }

  for (let i = 0; i < 5; i++) {
    if (carPositions[i].x >= finishLine) {
      text(`Car ${i + 1} wins!`, width / 2 - 110, 260 + i * 20);
      if (bets[i] > 0) {
        text(`You won $${int(bets[i] * odds[i])} on Car ${i + 1}!`, width / 2 - 25, 260 + i * 20);
        winner = true;
      }
    }
  }

  if (!winner) {
    text("You lost! No bets on winning cars.", width / 2 - 100, 220);
  }

  textAlign(CENTER);
  text("Press 'R' to reset for next race.", width / 2, 400);
  textAlign(LEFT);
}

function resetBets() {
  for (let i = 0; i < 5; i++) {
    bets[i] = 0;
  }
}

function keyPressed() {
  if (titleScreen) {
    if (key === ' ') titleScreen = false;
  } else {
    if (key === ' ') {
      if (!raceStarted && !raceEnded) {
        raceStarted = true;
        raceStartTime = millis();
        resultsProcessed = false; // Reset for the new race
        resetCars();
        raceEnded = false;
      }
    } else if (key === 'r' || key === 'R') {
      if (!raceStarted && raceEnded) {
        raceEnded = false;
        resetCars();
        resultsProcessed = false; // Reset the flag when a new race starts
        resetBets(); // Reset bets after each race
      }
    }
  }
}

function mousePressed() {
  for (let i = 0; i < 5; i++) {
    if (mouseX >= 10 && mouseX <= 40 && mouseY >= (i + 1) * 100 - 10 && mouseY <= (i + 1) * 100 + 20) {
      if (!raceStarted && !raceEnded && bets[i] > 0) {
        balance += 10; // Increase balance when the player reduces their bet
        bets[i] -= 10;
      }
    }
    if (mouseX >= 40 && mouseX <= 70 && mouseY >= (i + 1) * 100 - 10 && mouseY <= (i + 1) * 100 + 20) {
      if (!raceStarted && !raceEnded && balance >= 10) {
        balance -= 10; // Decrease balance when the player increases their bet
        bets[i] += 10;
      }
    }
  }
}

function drawStreets() {
  for (let i = 0; i < 5; i++) {
    fill(50); // Asphalt color
    rect(0, (i + 1) * 100 - 24, width, 60); // Street position

    fill(200); // Gray for lane markers
    for (let x = laneMarkerX[i]; x < width; x += 40) {
      rect(x, (i + 1) * 100 + 1, 20, 5); // Lane markers down the center of the street
    }

    laneMarkerX[i] -= laneMarkerSpeed;
    if (laneMarkerX[i] < -40) laneMarkerX[i] = 0; // Reset lane markers off-screen
  }
}

function drawInfoBoxes() {
  for (let i = 0; i < 5; i++) {
    let boxX = 5;
    let boxY = (i + 1) * 100 - 35;
    let boxWidth = 145;
    let boxHeight = 80;

    fill(150, 185, 250, 245); // Semi-transparent white
    stroke(0);
    rect(boxX, boxY, boxWidth, boxHeight); // Draw the box
  }
}

function drawClock() {
  if (raceStarted) {
    let remainingTime = raceDuration - (millis() - raceStartTime) / 1000.0;
    if (remainingTime < 0) remainingTime = 0;

    fill(0);
    textSize(20);
    textAlign(LEFT);
    text(`Time Left: ${nf(remainingTime, 1, 1)}s`, 10, height - 10); // Display the countdown
  }
}
