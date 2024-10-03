// Global variables
let rocketImage, explosionImage, safeImage, rocketLogo;
let rocketHeight = 0;
let rocketLaunched = false;
let exploded = false;
let withdrawn = false;
let safeDisplayed = false;  // New flag for safe image display
let multiplier = 0.0;  // Start multiplier below 1.0
let balance = 500.0;
let wager = 0;
let explosionTime;
let gameOver = false;
let explosionDisplayed = false; // Track whether the explosion is shown
let wagerDeducted = false; // Flag to ensure wager is deducted on explosion
let safePosX, safePosY;  // Position for safe animation
let finalMultiplier = 0.0;
let returnAmount = 0.0;
let previousMultipliers = [];  // Store previous round multipliers

// Constants for scale and multiplier calculation
const minMultiplier = 0.5;  // Start multiplier at 0.5
const maxMultiplier = 10.0;  // Max multiplier when rocket reaches the top of the scale
const displayMaxMultiplier = 8.0; // Limit the displayed multiplier to 8.00
const scaleHeight = 500;  // Height of the scale
const scaleStartY = 50;   // Where the scale begins at the top
const rocketStartY = 500; // Initial Y position for the rocket (bottom)
const rocketSpeed = 0.5;  // Slower rocket movement

function preload() {
  // Load your rocket and explosion images (replace with your file paths)
  rocketImage = loadImage('assets/rocket.png');
  explosionImage = loadImage('assets/explosion.png');
  safeImage = loadImage('assets/safe.png');
  rocketLogo = loadImage('assets/rocket_logo.png');
}

function setup() {
  createCanvas(600, 700);
  rocketLogo.resize(100, 100);
  resetGame();
}

function draw() {
  background(0, 0, 35);
  drawStarsAndPlanets();

  if (!explosionDisplayed && !safeDisplayed) {
    if (!rocketLaunched && !gameOver) {
      // Pre-launch screen
      fill(100, 50, 50, 100);
      rect(40, 75, 200, 65);
      rect(80, 220, 440, 245);
      fill(200);
      textAlign(CENTER);
      textSize(25);
      text('Balance: $' + nf(balance, 0, 2), 140, 100);
      textSize(20);
      text('Wager: $' + wager, 140, 130);
      textSize(22);
      text('Instructions:', width / 2, 250);
      text('Use Up and Down Arrows to Adjust Wager', width / 2, 280);
      text('After Launching the Rocket,', width / 2, 310);
      text('Get Out Before it Explodes!', width / 2, 340);
      text('The Longer You Stay In, The More You Make', width / 2, 370);
      text('Use the "B" Key to Bail!', width / 2, 400);
      fill(50, 100, 50);
      text('Press SPACE to launch!', width / 2, 450);
      
      drawPreviousMultipliers();  // Draw the previous multipliers section

      // Draw the rocket in the initial position on the pre-launch screen
      image(rocketImage, width / 2 - 50, rocketStartY, 120, 180);
    } else if (rocketLaunched && !gameOver) {
      fill(100, 50, 50, 100);
      rect(40, 75, 200, 65);
      fill(200);
      textAlign(CENTER);
      textSize(25);
      text('Balance: $' + nf(balance, 0, 2), 140, 100);
      textSize(20);
      text('Wager: $' + wager, 140, 130);
      fill(0);
      rect(0, height - 40, 275, 40);
      rect(0, height - 80, 200, 40);
      fill(200);
      textAlign(LEFT);
      textSize(26);
      text('Use the "B" Key to Bail!', 10, 690);
      text('Multiplier: ' + nf(multiplier, 1, 2) + 'x', 10, 650);

      if (!exploded) {
        rocketHeight -= rocketSpeed;

        // Calculate the multiplier using a quadratic progression (nonlinear)
        let distanceTraveled = rocketStartY - rocketHeight;
        let normalizedDistance = distanceTraveled / scaleHeight;  // Value between 0 and 1
        multiplier = minMultiplier + pow(normalizedDistance, 2) * (maxMultiplier - minMultiplier);

        if (millis() >= explosionTime) {
          exploded = true;  // The rocket explodes!
          finalMultiplier = multiplier;  // Store the final multiplier
          if (!wagerDeducted) {
            wagerDeducted = true;  // Ensure wager is only deducted once
          }
        }

        // Draw the rocket during flight
        image(rocketImage, width / 2 - 50, rocketHeight, 120, 180);

        // Draw the scale on the side during flight
        drawScale(multiplier);
        drawPreviousMultipliers();

        // Use the 'B' key to bail out
        if (keyIsDown(66) && !withdrawn && !exploded) {  // Key code for 'B'
          withdrawn = true;
          finalMultiplier = multiplier;
          returnAmount = wager * multiplier;
          balance += returnAmount;
          safeDisplayed = true;
          rocketLaunched = false;
          safePosX = width / 2 - 25;
          safePosY = rocketHeight;
          storePreviousMultiplier(finalMultiplier); // Store the final multiplier
        }
      } else {
        explosionDisplayed = true;
        image(explosionImage, width / 2 - 50, rocketHeight - 50, 100, 100);
      }
    }
  } else if (explosionDisplayed) {
    image(explosionImage, width / 2 - 50, rocketHeight - 50, 100, 100); // Show explosion image
    textSize(30);
    fill(255, 0, 0);
    text('Boom!', width / 2, rocketHeight - 50);
    
    fill(100, 50, 50, 100);
    rect(40, 75, 200, 65);
    fill(200);
    textAlign(CENTER);
    textSize(25);
    text('Balance: $' + nf(balance, 0, 2), 140, 100);
    textSize(20);
    text('Wager: $' + wager, 140, 130);
    textSize(20);
    fill(200);
    textAlign(LEFT);
    text('You Lost Your Wager!', 20, 200);
    text('Final Multiplier: ' + nf(finalMultiplier, 1, 2) + 'x', 20, 230);
    text('Press SPACE to continue', 20, 260);

    drawScale(multiplier); // Draw the scale after explosion
    drawPreviousMultipliers();

    if (keyIsPressed && key === ' ') {
      storePreviousMultiplier(finalMultiplier); // Store the final multiplier after explosion
      resetGame();
    }

  } else if (safeDisplayed) {
    image(safeImage, safePosX - 20, safePosY - 40, 100, 150); // Show safe image at rocket's last position
    textSize(30);
    fill(50, 100, 50);
    text('Safe!', width / 2, safePosY - 50);
    
    fill(100, 50, 50, 100);
    rect(40, 75, 200, 65);
    fill(200);
    textAlign(CENTER);
    textSize(25);
    text('Balance: $' + nf(balance, 0, 2), 140, 100);
    textSize(20);
    text('Wager: $' + wager, 140, 130);
    textSize(18);
    textAlign(LEFT);
    text('You Bailed In Time!', 20, 200);
    text('Final Multiplier: ' + nf(finalMultiplier, 1, 2) + 'x', 20, 230);
    text('Return: $' + nf(returnAmount, 0, 2), 20, 260);
    text('Press SPACE to continue', 20, 290);

    drawScale(finalMultiplier); // Draw the scale after safe bailout
    drawPreviousMultipliers();

    if (keyIsPressed && key === ' ') {
      resetGame();
    }
  }
  
  image(rocketLogo, (width / 2) - 100, -75, 200, 200); // Centered at the top
}

function resetGame() {
  rocketLaunched = false;
  exploded = false;
  withdrawn = false;
  safeDisplayed = false;
  explosionDisplayed = false;
  rocketHeight = rocketStartY;
  multiplier = minMultiplier;
  wagerDeducted = false;  // Reset the wager deduction flag
  explosionTime = millis() + int(random(1500, 16000)); // Set explosion time with a larger minimum value
  wager = 0;
}

function keyPressed() {
  if (!rocketLaunched && !explosionDisplayed && !safeDisplayed) {
    if (keyCode === UP_ARROW && wager < balance) {
      wager += 10;
    } else if (keyCode === DOWN_ARROW && wager > 0) {
      wager -= 10;
    } else if (key === ' ' && wager > 0 && wager <= balance) {
      rocketLaunched = true;
      balance -= wager; // Subtract wager only once at the start of the round
      wagerDeducted = true; // Ensure that wager is marked as deducted
    }
  }
}

// Store the final multiplier of the round
function storePreviousMultiplier(multiplier) {
  previousMultipliers.push(multiplier);
  if (previousMultipliers.length > 10) {  // Store only the last 5 multipliers
    previousMultipliers.shift();
  }
}

function drawPreviousMultipliers() {
  fill(255);
  stroke(0);
  strokeWeight(2);
  fill(100, 100);
  rect(width - 150, height - 220, 140, 200);

  fill(200);
  line(width - 150, height - 195, width - 10, height - 195);
  textAlign(CENTER);
  textSize(16);
  text('Previous Launches', width - 80, height - 200);

  textAlign(CENTER);
  textSize(16);
  for (let i = 0; i < previousMultipliers.length; i++) {
    text(nf(previousMultipliers[i], 1, 2) + 'x', width - 80, height - 175 + i * 15);
  }
}

function drawScale(currentMultiplier) {
  let scaleX = width / 2 + 100;
  let scaleYStart = rocketStartY;
  let scaleYEnd = scaleStartY;

  stroke(255);
  strokeWeight(4);
  line(scaleX, scaleYStart, scaleX, scaleYEnd); // Draw the vertical scale line

  strokeWeight(2);
  for (let mult = minMultiplier; mult <= displayMaxMultiplier; mult += 0.25) {
    let normalizedMult = sqrt((mult - minMultiplier) / (maxMultiplier - minMultiplier));
    let yPosition = scaleYStart - normalizedMult * scaleHeight;

    if (int(mult * 100) % 25 === 0) {
      line(scaleX - 5, yPosition, scaleX + 5, yPosition);
    }

    if (int(mult * 100) % 50 === 0) {
      fill(200);
      textSize(12);
      textAlign(RIGHT);
      stroke(0);
      text(nf(mult, 1, 2) + 'x', scaleX - 15, yPosition + 5);
      stroke(255);
    }
  }

  let currentY = scaleYStart - sqrt((currentMultiplier - minMultiplier) / (maxMultiplier - minMultiplier)) * scaleHeight;
  stroke(255, 0, 0);
  line(scaleX - 15, currentY, scaleX + 15, currentY);
}

function drawStarsAndPlanets() {
  fill(255, 255, 255);
  noStroke();
  for (let i = 0; i < 50; i++) {
    let starX = random(width);
    let starY = random(20, height - 20);
    let starSize = random(1, 3);
    ellipse(starX, starY, starSize, starSize);
  }
}
