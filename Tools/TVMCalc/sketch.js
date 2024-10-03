// Global Variables
let principal = "";   // Initial investment (P)
let rate = "";        // Interest rate (r)
let years = "";       // Time period in years (t)
let compoundsPerYear = ""; // Compounding frequency (n)
let futureValue = ""; // Future Value (FV)

let calculatePressed = false;  // Button trigger
let clearPressed = false;      // Clear button trigger
let errorMessage = "";

// Variables for radio buttons (which variable to solve for)
let solveForPrincipal = false;
let solveForRate = false;
let solveForYears = false;
let solveForCompounds = false;
let solveForFutureValue = false;

function setup() {
  createCanvas(500, 600);
  textAlign(CENTER);
}

function draw() {
  background(200);

  // Draw the black border
  stroke(0);      // Set stroke color to black
  strokeWeight(4); // Set the thickness of the border
  noFill();        // Ensure that the rectangle has no fill color
  rect(20, 10, width - 40, height - 15);
  strokeWeight(1);
  
  // Title
  textSize(24);
  fill(0);
  textAlign(CENTER);
  text("Time Value of Money Calculator", width / 2, 50);
  
  // Input Labels
  textSize(16);
  textAlign(RIGHT);
  text("Principal ($):", 240, 120);
  text("Interest Rate (%):", 240, 160);
  text("Time (Years):", 240, 200);
  text("Compounds per Year:", 240, 240);
  text("Future Value ($):", 240, 280);
  textAlign(CENTER);
  
  // Draw input fields
  fill(0);
  textSize(12);
  text("(Click Boxes to Edit)", 300, 95);
  fill(255);
  rect(250, 100, 100, 30); // Principal
  rect(250, 140, 100, 30); // Interest rate
  rect(250, 180, 100, 30); // Time in years
  rect(250, 220, 100, 30); // Compounds per year
  rect(250, 260, 100, 30); // Future value
  textSize(20);
  
  // Display inputs in the fields
  fill(0);
  text(principal, 300, 120 + 2);
  text(rate, 300, 160 + 2);
  text(years, 300, 200 + 2);
  text(compoundsPerYear, 300, 240 + 2);
  text(futureValue, 300, 280 + 2);
  
  // Radio Buttons for solving variable
  textSize(14);
  text("Solve for:", 100, 340);
  textSize(11);
  text("(Choose One)", 170, 338);
  textSize(14);
  
  // Draw radio buttons
  drawRadioButton(120, 360, "Principal", solveForPrincipal);
  drawRadioButton(120, 390, "Rate", solveForRate);
  drawRadioButton(120, 420, "Years", solveForYears);
  drawRadioButton(120, 450, "Compounds", solveForCompounds);
  drawRadioButton(120, 480, "Future Value", solveForFutureValue);
  
  // Calculate button
  fill(150);
  rect(width / 2 - 50, 500, 100, 40);
  fill(0);
  textAlign(CENTER);
  text("Calculate", width / 2, 525);
  
  // Clear All button
  fill(150);
  rect(width / 2 - 50, 550, 100, 40);
  fill(0);
  text("Clear All", width / 2, 575);
  
  // Error message
  fill(255, 0, 0);
  text(errorMessage, width / 2, 70);
  
  // If calculate is pressed, solve for the selected unknown variable
  if (calculatePressed) {
    errorMessage = solveForUnknown();
    calculatePressed = false;
  }
  
  // Clear the inputs if clearPressed is true
  if (clearPressed) {
    clearInputs();
    clearPressed = false;
  }
}

// Function to draw radio buttons
function drawRadioButton(x, y, label, selected) {
  fill(255);
  stroke(0);
  ellipse(x, y, 15, 15);
  if (selected) {
    fill(0);
    ellipse(x, y, 7, 7);
  }
  fill(0);
  textAlign(LEFT);
  text(label, x + 20, y + 5);
}

// Detect mouse clicks
function mousePressed() {
  // Check if Calculate button is pressed
  if (mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > 500 && mouseY < 540) {
    calculatePressed = true;
  }
  
  // Check if Clear All button is pressed
  if (mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > 550 && mouseY < 590) {
    clearPressed = true;
  }
  
  // Check for radio button clicks to select which variable to solve for
  if (mouseX > 105 && mouseX < 135) {
    if (mouseY > 345 && mouseY < 375) {
      resetSolveFor();
      solveForPrincipal = true;
    }
    if (mouseY > 375 && mouseY < 405) {
      resetSolveFor();
      solveForRate = true;
    }
    if (mouseY > 405 && mouseY < 435) {
      resetSolveFor();
      solveForYears = true;
    }
    if (mouseY > 435 && mouseY < 465) {
      resetSolveFor();
      solveForCompounds = true;
    }
    if (mouseY > 465 && mouseY < 495) {
      resetSolveFor();
      solveForFutureValue = true;
    }
  }
  
  // Check if principal field is clicked
  if (mouseX > 250 && mouseX < 350 && mouseY > 100 && mouseY < 130) {
    if (!solveForPrincipal) {
      let newPrincipal = prompt("Enter new principal:");
      if (newPrincipal != null && newPrincipal.length > 0) {
        principal = newPrincipal;
      }
    }
  }
  
  // Check if interest rate field is clicked
  if (mouseX > 250 && mouseX < 350 && mouseY > 140 && mouseY < 170) {
    if (!solveForRate) {
      let newRate = prompt("Enter new interest rate (%):");
      if (newRate != null && newRate.length > 0) {
        rate = newRate;
      }
    }
  }
  
  // Check if time (years) field is clicked
  if (mouseX > 250 && mouseX < 350 && mouseY > 180 && mouseY < 210) {
    if (!solveForYears) {
      let newYears = prompt("Enter number of years:");
      if (newYears != null && newYears.length > 0) {
        years = newYears;
      }
    }
  }
  
  // Check if compounds per year field is clicked
  if (mouseX > 250 && mouseX < 350 && mouseY > 220 && mouseY < 250) {
    if (!solveForCompounds) {
      let newCompounds = prompt("Enter number of compounds per year:");
      if (newCompounds != null && newCompounds.length > 0) {
        compoundsPerYear = newCompounds;
      }
    }
  }
  
  // Check if future value field is clicked
  if (mouseX > 250 && mouseX < 350 && mouseY > 260 && mouseY < 290) {
    if (!solveForFutureValue) {
      let newFutureValue = prompt("Enter new future value:");
      if (newFutureValue != null && newFutureValue.length > 0) {
        futureValue = newFutureValue;
      }
    }
  }
}

// Reset which variable is selected for solving
function resetSolveFor() {
  solveForPrincipal = false;
  solveForRate = false;
  solveForYears = false;
  solveForCompounds = false;
  solveForFutureValue = false;
}

// Function to clear all inputs
function clearInputs() {
  principal = "";
  rate = "";
  years = "";
  compoundsPerYear = "";
  futureValue = "";
}

// Function to solve for the selected unknown variable
function solveForUnknown() {
  try {
    // Parse inputs (leave empty input for the selected variable)
    let P = solveForPrincipal ? 0 : parseFloat(principal);
    let r = solveForRate ? 0 : parseFloat(rate) / 100;
    let t = solveForYears ? 0 : parseFloat(years);
    let n = solveForCompounds ? 0 : parseInt(compoundsPerYear);
    let FV = solveForFutureValue ? 0 : parseFloat(futureValue);
    
    // Solve for the selected variable
    if (solveForPrincipal) {
      principal = (FV / Math.pow(1 + (r / n), n * t)).toFixed(2);
    } else if (solveForRate) {
      rate = (n * (Math.pow(FV / P, 1 / (n * t)) - 1) * 100).toFixed(2);
    } else if (solveForYears) {
      years = (Math.log(FV / P) / (n * Math.log(1 + r / n))).toFixed(2);
    } else if (solveForCompounds) {
      compoundsPerYear = (Math.log(FV / P) / (t * Math.log(1 + r))).toFixed(2);
    } else if (solveForFutureValue) {
      futureValue = (P * Math.pow(1 + (r / n), n * t)).toFixed(2);
    } else {
      return "Please select a variable to solve for.";
    }
    
    return "";
  } catch (e) {
    return "Invalid inputs! Please check your values.";
  }
}
