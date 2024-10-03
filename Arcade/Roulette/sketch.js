let balance = 1000; // Player's balance
let bet = 0; // Total bet amount
let betNumbers = []; // List of numbers the player bets on
let logo;
let resultMessage = "";
let betOnFirst18 = false;
let betOnLast18 = false;
let betOnOdd = false;
let betOnEven = false;
let betOnFirst12 = false;
let betOnSecond12 = false;
let betOnThird12 = false;
let betOnRed = false;
let betOnBlack = false;
let resultNumber = -1; // Result of the roulette spin
let spinning = false; // If the roulette is spinning
let spinSpeed = 0; // Speed of the spinning wheel
let angle = 0; // Current angle of the wheel
let totalSegments = 38; // Total number of segments (0, 00, and 1-36)
let numbers = ["00", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2", "0", "28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1"];
let targetAngle = 0; // Target angle where the wheel will stop
let spinDuration = 0; // Number of frames the wheel will spin
let canPlaceBets = true; // Allow the player to place bets
let previousResults = []; // Track last 5 results

function isRed(result) {
    let redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(result);
  }
  
  function isBlack(result) {
    let blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    return blackNumbers.includes(result);
  }
  
  function isOdd(result) {
    return result > 0 && result % 2 !== 0;
  }
  
  function isEven(result) {
    return result > 0 && result % 2 === 0;
  }
  

function preload() {
  logo = loadImage("assets/roulettelogo.png");
}

function setup() {
  createCanvas(1125, 750); // Wider horizontal layout
  textAlign(CENTER, CENTER);
  textSize(16);
  logo.resize(600, 250);
}

function draw() {
    background(30, 90, 5);
    image(logo, width / 2 - logo.width / 2, -20);  // Center the image at the top
  
    // Draw betting information and components
    drawBettingInfo();
    drawBettingBoard();
    drawBettingOptions();
    displayPreviousResults();
    drawWheel();
    drawArrow();
  
    // Spin logic
    if (spinning) {
      angle += spinSpeed; // Rotate the wheel
      if (spinSpeed > 0 && frameCount % 3 === 0) {
        spinSpeed *= 0.99; // Slowly decrease the speed to stop
      }
  
      if (spinSpeed < 0.01) { // When the wheel stops
        spinning = false;
        spinSpeed = 0; // Ensure the wheel stops
        let winner = getWinningSegment(); // Get the winning segment index
        resultNumber = (numbers[winner] === "00") ? 37 : (numbers[winner] === "0") ? 0 : int(numbers[winner]);
        checkResult();
        resultMessage = "Result: " + (resultNumber === 37 ? "00" : resultNumber);
      }
    }
  
    // Display result and message
    if (resultNumber !== -1) {
      fill(255);
      textSize(24);
      text(resultNumber === 37 ? "Result: 00" : "Result: " + resultNumber, width / 2, 730); // Display at the bottom
    }
  
    if (resultMessage !== "") {
      fill(255);
      textSize(24);
      text(resultMessage, width / 2, 760); // Adjust this position as needed
    }
  }  

function drawBettingInfo() {
  fill(120, 150, 180);
  rect(300, 220, 300, 110);
  fill(0);
  textSize(35);
  text("Balance: $" + balance, width / 3 + 70, 250); // Align balance
  textSize(25);

  if (betNumbers.length > 0 || betOnFirst18 || betOnLast18 || betOnOdd || betOnEven || betOnFirst12 || betOnSecond12 || betOnThird12 || betOnRed || betOnBlack) {
    text("Bet: $" + bet, width / 3 + 70, 300);
  } else {
    text("Place a bet to start", width / 3 + 70, 300);
  }
}

function drawBettingBoard() {
  let cols = 3;
  let cellW = 60;
  let cellH = 50;
  let offsetX = 50;
  let offsetY = 50;

  // Draw the number grid from 1-36
  for (let i = 0; i < 36; i++) {
    let x = (i % cols) * cellW + offsetX;
    let y = Math.floor(i / cols) * cellH + offsetY;

    fill(255);
    rect(x, y, cellW, cellH);
    fill(0);
    text(i + 1, x + cellW / 2, y + cellH / 2);

    if (betNumbers.includes(i + 1)) {
      fill(0, 150, 0); // Highlight bet numbers
      rect(x, y, cellW, cellH);
      fill(0);
      text(i + 1, x + cellW / 2, y + cellH / 2);
    }
  }

  // Draw 0 and 00 separately
  drawSpecialBets(cellW, cellH, offsetX, offsetY);
}

function drawSpecialBets(cellW, cellH, offsetX, offsetY) {
  // Check if 0 is in the betNumbers list for highlighting
  fill(betNumbers.includes(0) ? color(0, 150, 0) : 255);
  rect(offsetX * 1.5, 650, cellW, cellH); // Position for 0
  fill(0);
  text("0", offsetX * 1.5 + cellW / 2, 650 + cellH / 2);

  // Check if 00 is in the betNumbers list for highlighting
  fill(betNumbers.includes(37) ? color(0, 150, 0) : 255);
  rect(offsetX * 1.5 + cellW, 650, cellW, cellH); // Position for 00
  fill(0);
  text("00", offsetX * 1.5 + cellW + cellW / 2, 650 + cellH / 2);
}

function drawBettingOptions() {
  let buttonW = 100;
  let buttonH = 50;
  let offsetX = 275;
  let offsetY = 710;

  drawBetButton(betOnRed, offsetX + 120, offsetY - 60, "Red", () => betOnRed = !betOnRed);
  drawBetButton(betOnBlack, offsetX, offsetY - 60, "Black", () => betOnBlack = !betOnBlack);
  drawBetButton(betOnFirst18, offsetX, offsetY - 120, "1-18", () => betOnFirst18 = !betOnFirst18);
  drawBetButton(betOnLast18, offsetX + 120, offsetY - 120, "19-36", () => betOnLast18 = !betOnLast18);
  drawBetButton(betOnOdd, offsetX + 240, offsetY - 120, "Odd", () => betOnOdd = !betOnOdd);
  drawBetButton(betOnEven, offsetX + 240, offsetY - 60, "Even", () => betOnEven = !betOnEven);
  drawBetButton(betOnFirst12, offsetX, offsetY - 180, "1-12", () => betOnFirst12 = !betOnFirst12);
  drawBetButton(betOnSecond12, offsetX + 120, offsetY - 180, "13-24", () => betOnSecond12 = !betOnSecond12);
  drawBetButton(betOnThird12, offsetX + 240, offsetY - 180, "25-36", () => betOnThird12 = !betOnThird12);
}

function drawBetButton(isBetOn, x, y, label, toggleBet) {
  fill(isBetOn ? color(0, 150, 0) : 255);
  rect(x, y, 100, 50);
  fill(0);
  text(label, x + 50, y + 25);
}

function displayPreviousResults() {
    fill(255);
    textSize(18);
    text("Previous Results:", 900, 605);
  
    for (let i = 0; i < previousResults.length; i++) {
      let displayNumber = previousResults[i] === 37 ? "00" : previousResults[i];
      textSize(18);
      text(displayNumber, 1050 - i * 30, 660);  // Adjust positioning as necessary
    }
  }
  

function drawWheel() {
  push();
  translate(850, height / 2); // Center the wheel on the right side
  let segmentAngle = TWO_PI / totalSegments;

  for (let i = 0; i < totalSegments; i++) {
    let currentAngle = angle + i * segmentAngle;
    fill(i === 0 || i === 19 ? color(0, 150, 0) : i % 2 === 0 ? color(180, 0, 0) : 0);
    arc(0, 0, 400, 400, currentAngle, currentAngle + segmentAngle, PIE);
    fill(255);
    let textAngle = currentAngle + segmentAngle / 2;
    let x = cos(textAngle) * 160;
    let y = sin(textAngle) * 160;
    textSize(16);
    text(numbers[i], x, y);
  }
  pop();
}

function drawArrow() {
  fill(255);
  triangle(1100, height / 2 - 20, 1100, height / 2 + 20, 1040, height / 2);
}

function getWinningSegment() {
  let normalizedAngle = angle % TWO_PI;
  let segmentAngle = TWO_PI / totalSegments;
  let segment = int((TWO_PI - normalizedAngle) / segmentAngle) % totalSegments;
  return segment;
}

function checkResult() {
    let totalWin = 0; // Track total winnings
  
    // Payout logic for specific number bets (35:1)
    for (let betNum of betNumbers) {
      if (betNum === resultNumber) {
        totalWin += 10 * 35;  // Each number bet is $10, 35:1 payout
      }
    }
  
    // Payout logic for Red/Black (1:1)
    if (betOnRed && isRed(resultNumber)) totalWin += 10 * 2;
    if (betOnBlack && isBlack(resultNumber)) totalWin += 10 * 2;
  
    // Payout logic for 1st 18/19-36 (1:1)
    if (betOnFirst18 && resultNumber > 0 && resultNumber <= 18) totalWin += 10 * 2;
    if (betOnLast18 && resultNumber > 18 && resultNumber <= 36) totalWin += 10 * 2;
  
    // Payout logic for Odd/Even (1:1)
    if (betOnOdd && isOdd(resultNumber)) totalWin += 10 * 2;
    if (betOnEven && isEven(resultNumber) && resultNumber !== 0 && resultNumber !== 37) totalWin += 10 * 2;
  
    // Payout logic for 1st 12/2nd 12/3rd 12 (3:1)
    if (betOnFirst12 && resultNumber > 0 && resultNumber <= 12) totalWin += 10 * 3;
    if (betOnSecond12 && resultNumber > 12 && resultNumber <= 24) totalWin += 10 * 3;
    if (betOnThird12 && resultNumber > 24 && resultNumber <= 36) totalWin += 10 * 3;
  
    // Update balance and message
    if (totalWin > 0) {
      balance += totalWin;
      resultMessage = "You win! New balance: $" + balance;
    } else {
      resultMessage = "You lose. New balance: $" + balance;
    }
  
    // Update previous results (limit to last 5 results)
    previousResults.push(resultNumber);
    if (previousResults.length > 5) {
      previousResults.shift();  // Remove the oldest result
    }
  
    resetBets();  // Reset bets for the next round
  }
   
  
  function resetBets() {
    bet = 0;
    betNumbers = [];
    betOnFirst18 = false;
    betOnLast18 = false;
    betOnOdd = false;
    betOnEven = false;
    betOnFirst12 = false;
    betOnSecond12 = false;
    betOnThird12 = false;
    betOnRed = false;
    betOnBlack = false;
    resultMessage = ""; // Clear the result message
    canPlaceBets = true;  // Allow placing bets again for the next round
    // Delay resetting the resultNumber until the player has seen the result
    setTimeout(() => {
      resultNumber = -1; // Reset the result number after a delay (e.g., after 5 seconds)
    }, 2500); // You can adjust the delay duration
  }
  
  

function mousePressed() {
  if (canPlaceBets && !spinning) {
    handleNumberBets();
    handleOtherBets();
  }
}

function handleNumberBets() {
    let cols = 3;
    let cellW = 60;
    let cellH = 50;
    let offsetX = 50;
    let offsetY = 50;
  
    // Loop through numbers 1-36 and check if the mouse is inside a cell
    for (let i = 0; i < 36; i++) {
      let x = (i % cols) * cellW + offsetX;
      let y = Math.floor(i / cols) * cellH + offsetY;
  
      if (mouseX > x && mouseX < x + cellW && mouseY > y && mouseY < y + cellH) {
        toggleBet(i + 1);  // Use the toggleBet function to handle placing/removing bets
        return; // Exit function to avoid running 0 and 00 logic
      }
    }
  
    // Handle bets for 0 and 00 separately
    if (mouseX > 80 && mouseX < 80 + cellW && mouseY > 650 && mouseY < 650 + cellH) {
      toggleBet(0);  // Bet on 0
    } else if (mouseX > 80 + cellW && mouseX < 80 + 2 * cellW && mouseY > 650 && mouseY < 650 + cellH) {
      toggleBet(37);  // Bet on 00 (represented by 37)
    }
  }
  
  
  function toggleBet(number) {
    // Check if the number is already in betNumbers
    if (!betNumbers.includes(number)) {
      betNumbers.push(number);  // Add number to the bet list
      bet += 10;  // Increase bet by $10
      balance -= 10;  // Decrease balance by $10
    } else {
      // Remove number from bet list and adjust bet and balance
      betNumbers.splice(betNumbers.indexOf(number), 1);
      bet -= 10;  // Decrease bet by $10
      balance += 10;  // Increase balance by $10
    }
  }
  
  
  

  function handleOtherBets() {
    let buttonW = 100;
    let buttonH = 50;
    let offsetX = 275;
    let offsetY = 710;

    // Handle 1st 12, 2nd 12, and 3rd 12 buttons
    if (mouseX > offsetX && mouseX < offsetX + buttonW && mouseY > offsetY - 180 && mouseY < offsetY - 180 + buttonH) {
        betOnFirst12 = !betOnFirst12;
        if (betOnFirst12) {
        bet += 10;
        balance -= 10;
        } else {
        bet -= 10;
        balance += 10;
        }
    }
    
    if (mouseX > offsetX + 120 && mouseX < offsetX + 120 + buttonW && mouseY > offsetY - 180 && mouseY < offsetY - 180 + buttonH) {
        betOnSecond12 = !betOnSecond12;
        if (betOnSecond12) {
        bet += 10;
        balance -= 10;
        } else {
        bet -= 10;
        balance += 10;
        }
    }
    
    if (mouseX > offsetX + 240 && mouseX < offsetX + 240 + buttonW && mouseY > offsetY - 180 && mouseY < offsetY - 180 + buttonH) {
        betOnThird12 = !betOnThird12;
        if (betOnThird12) {
        bet += 10;
        balance -= 10;
        } else {
        bet -= 10;
        balance += 10;
        }
    }
  
  
    // Red button
    if (mouseX > offsetX + 120 && mouseX < offsetX + 120 + buttonW && mouseY > offsetY - 60 && mouseY < offsetY - 60 + buttonH) {
      betOnRed = !betOnRed;  
      if (betOnRed) {
        bet += 10;
        balance -= 10;
      } else {
        bet -= 10;
        balance += 10;
      }
    }
  
    // Black button
    if (mouseX > offsetX && mouseX < offsetX + buttonW && mouseY > offsetY - 60 && mouseY < offsetY - 60 + buttonH) {
      betOnBlack = !betOnBlack;
      if (betOnBlack) {
        bet += 10;
        balance -= 10;
      } else {
        bet -= 10;
        balance += 10;
      }
    }
  
    // 1-18 button
    if (mouseX > offsetX && mouseX < offsetX + buttonW && mouseY > offsetY - 120 && mouseY < offsetY - 120 + buttonH) {
      betOnFirst18 = !betOnFirst18;
      if (betOnFirst18) {
        bet += 10;
        balance -= 10;
      } else {
        bet -= 10;
        balance += 10;
      }
    }
  
    // 19-36 button
    if (mouseX > offsetX + 120 && mouseX < offsetX + 120 + buttonW && mouseY > offsetY - 120 && mouseY < offsetY - 120 + buttonH) {
      betOnLast18 = !betOnLast18;
      if (betOnLast18) {
        bet += 10;
        balance -= 10;
      } else {
        bet -= 10;
        balance += 10;
      }
    }
  
    // Odd button
    if (mouseX > offsetX + 240 && mouseX < offsetX + 240 + buttonW && mouseY > offsetY - 120 && mouseY < offsetY - 120 + buttonH) {
      betOnOdd = !betOnOdd;
      if (betOnOdd) {
        bet += 10;
        balance -= 10;
      } else {
        bet -= 10;
        balance += 10;
      }
    }
  
    // Even button
    if (mouseX > offsetX + 240 && mouseX < offsetX + 240 + buttonW && mouseY > offsetY - 60 && mouseY < offsetY - 60 + buttonH) {
      betOnEven = !betOnEven;
      if (betOnEven) {
        bet += 10;
        balance -= 10;
      } else {
        bet -= 10;
        balance += 10;
      }
    }
  }  
  

function handleBetToggle(betState, x, y, toggle) {
    if (mouseX > x && mouseX < x + 100 && mouseY > y && mouseY < y + 50) {
      // Toggle the bet state
      toggle();
  
      // If the bet is ON, increase the bet and decrease the balance
      if (betState === false) {
        bet += 10;
        balance -= 10;
      } 
      // If the bet is OFF, decrease the bet and increase the balance
      else if (betState === true) {
        bet -= 10;
        balance += 10;
      }
    }
  }
  

function keyPressed() {
  if (key === ' ' && (betNumbers.length > 0 || betOnFirst18 || betOnLast18 || betOnOdd || betOnEven || betOnFirst12 || betOnSecond12 || betOnThird12 || betOnRed || betOnBlack)) {
    spinning = true;
    canPlaceBets = false;
    spinSpeed = random(0.05, 0.1); // Set random spin speed
    spinDuration = int(random(1, 2)); // Set random spin duration
  }
}
