// Loan parameters
let loanAmount = 100000;      // Principal amount
let interestRate = 5;         // Annual interest rate (percentage)
let loanTerm = 360;           // Loan term in months (changed from years)
let compoundingPeriods = 12;  // Compounding periods per year (integer value)
let amortizationType = "Fixed"; // Options: Fixed, Interest-Only, Balloon
let calculatePressed = false;   // Button to trigger calculation
let showSchedule = false;       // Flag to toggle between calculator and schedule
let balloonAmount = 0;          // Balloon payment amount
let errorMessage = "";          // For displaying errors

let amortizationSchedule;  // Store amortization schedule (Principal, Interest, Total Payment, Balance)
let currentYear = 0;             // Track the current year (pagination for schedule display)
let monthsPerPage = 12;          // Display 12 months (1 year) per page

function setup() {
  createCanvas(800, 500);
  textFont('Arial', 16);
}

function draw() {
    background(255);
    // Show the calculator screen or the amortization schedule based on the flag
    if (showSchedule) {
      displayAmortizationSchedule();
    } else {
      displayCalculatorScreen();
    }
  }
  

// Function to display the calculator input screen
function displayCalculatorScreen() {

    // Draw the black border around the entire program
    stroke(0); 
    strokeWeight(5); 
    noFill(); 
    rect(0, 0, width, height);
    strokeWeight(0);

  // Title
  textSize(24);
  fill(0);
  textAlign(CENTER);
  text("Loan Amortization Calculator", width / 2, 40);
  
  // Input Labels and Fields
  textSize(16);
  fill(0);
  textAlign(LEFT);
  
  text("Loan Amount ($):", 240, 140);
  text("Interest Rate (%):", 240, 180);
  text("Loan Term (Months):", 240, 220);  // Changed to months
  text("Compounding Periods per Year:", 240, 260);  // Dynamic compounding periods
  text("Amortization Type:", 240, 300);
  
  // Draw input fields
  fill(200);
  rect(400, 120, 150, 30);  // Loan Amount
  rect(400, 160, 150, 30);  // Interest Rate
  rect(400, 200, 150, 30);  // Loan Term
  rect(400, 240, 150, 30);  // Compounding Periods
  rect(400, 280, 150, 30);  // Amortization Type
  
  // Display inputs
  fill(0);
  textAlign(CENTER);
  text(str(loanAmount), 475, 140 + 2);
  text(str(interestRate), 475, 180 + 2);
  text(str(loanTerm), 475, 220 + 2);  // Display in months
  text(str(compoundingPeriods), 475, 260 + 2);  // Display compounding periods dynamically
  text(amortizationType, 475, 300 + 2);
  
  // Show balloon input if "Balloon" is selected
  if (amortizationType === "Balloon") {
    fill(0);
    textAlign(LEFT);
    text("Balloon Payment ($):", 240, 340);
    fill(200);
    rect(400, 320, 150, 30);  // Balloon payment input box
    
    fill(0);
    textAlign(CENTER);
    text(str(balloonAmount), 475, 340 + 2);
  }
  
  // Calculate button
  fill(150);
  rect(width / 2 - 50, 440, 100, 40);
  fill(0);
  text("Calculate", width / 2, 465);
  
  // Display error message
  fill(255, 0, 0);
  textAlign(CENTER);
  text(errorMessage, width / 2, 400);
  
  // If calculation is triggered
  if (calculatePressed) {
    amortizationSchedule = calculateAmortizationSchedule();
    calculatePressed = false;
    showSchedule = true;  // Switch to the amortization schedule view
  }
}

// Function to display the amortization schedule on screen with pagination
function displayAmortizationSchedule() {
  background(255);

      // Draw the black border around the entire program
      stroke(0); 
      strokeWeight(5); 
      noFill(); 
      rect(0, 0, width, height);
      strokeWeight(0);
      
  // Display instructions
  fill(0);
  textSize(22);
  textAlign(CENTER);
  text("Amortization Schedule - Year " + (currentYear + 1), width / 2, 50);
  text("Press 'R' to Return to Calculator", width / 2, 450);
  
  // Display column headers
  textSize(14);
  textAlign(LEFT);
  text("Month", 150, 100);
  text("Principal", 250, 100);
  text("Interest", 350, 100);
  text("Payment", 450, 100);
  text("Balance", 550, 100);
  
  // Display the schedule data for the current year (12 months)
  let startMonth = currentYear * monthsPerPage;
  for (let i = 0; i < monthsPerPage; i++) {
    let monthIndex = startMonth + i;
    if (monthIndex >= amortizationSchedule.length) break;  // Stop if we've reached the end
    
    text(i + 1, 150, 130 + i * 20);
    text(nf(amortizationSchedule[monthIndex][0], 0, 2), 250, 130 + i * 20);  // Principal
    text(nf(amortizationSchedule[monthIndex][1], 0, 2), 350, 130 + i * 20);  // Interest
    text(nf(amortizationSchedule[monthIndex][2], 0, 2), 450, 130 + i * 20);  // Total Payment
    text(nf(amortizationSchedule[monthIndex][3], 0, 2), 550, 130 + i * 20);  // Balance
  }
  
  // "Previous Page" and "Next Page" buttons
  fill(150);
  if (currentYear > 0) {
    rect(100, 400, 100, 40);
    fill(0);
    text("Previous", 125, 425);
  }
  if (currentYear < (amortizationSchedule.length / monthsPerPage) - 1 || 
      (currentYear == (amortizationSchedule.length / monthsPerPage) - 1 && 
       amortizationSchedule.length % monthsPerPage != 0)) {
      fill(150);
      rect(600, 400, 100, 40);
      fill(0);
      text("Next", 635, 425);
  }
}

// Detect mouse clicks
function mousePressed() {
  if (!showSchedule) {
    // Input for Loan Amount
    if (mouseX > 400 && mouseX < 550 && mouseY > 120 && mouseY < 150) {
      let input = prompt("Enter loan amount:");
      if (input != null && input.length > 0) {
        try {
          loanAmount = float(input);
        } catch (e) {
          errorMessage = "Invalid loan amount!";
        }
      }
    }

    // Input for Interest Rate
    if (mouseX > 400 && mouseX < 550 && mouseY > 160 && mouseY < 190) {
      let input = prompt("Enter interest rate:");
      if (input != null && input.length > 0) {
        try {
          interestRate = float(input);
        } catch (e) {
          errorMessage = "Invalid interest rate!";
        }
      }
    }

    // Input for Loan Term
    if (mouseX > 400 && mouseX < 550 && mouseY > 200 && mouseY < 230) {
      let input = prompt("Enter loan term (months):");
      if (input != null && input.length > 0) {
        try {
          loanTerm = int(input);  // Expecting months as input
        } catch (e) {
          errorMessage = "Invalid loan term!";
        }
      }
    }

    // Input for Compounding Periods
    if (mouseX > 400 && mouseX < 550 && mouseY > 240 && mouseY < 270) {
      let input = prompt("Enter compounding periods per year:");
      if (input != null && input.length > 0) {
        try {
          compoundingPeriods = int(input);  // Integer for compounding periods
        } catch (e) {
          errorMessage = "Invalid compounding periods!";
        }
      }
    }

    // Input for Amortization Type
    if (mouseX > 400 && mouseX < 550 && mouseY > 280 && mouseY < 310) {
      let options = ["Fixed", "Interest-Only", "Balloon"];
      let input = prompt("Select amortization type (Fixed, Interest-Only, Balloon):", options[0]);
      if (input != null) {
        amortizationType = input;
      }
    }

    // Balloon payment input
    if (amortizationType === "Balloon" && mouseX > 400 && mouseX < 550 && mouseY > 320 && mouseY < 350) {
      let input = prompt("Enter balloon payment amount:");
      if (input != null && input.length > 0) {
        try {
          balloonAmount = float(input);
        } catch (e) {
          errorMessage = "Invalid balloon amount!";
        }
      }
    }

    // Check if Calculate button is pressed
    if (mouseX > width / 2 - 50 && mouseX < width / 2 + 50 && mouseY > 440 && mouseY < 480) {
      calculatePressed = true;
    }
  } else {
    // Check if "Previous" button is pressed
    if (mouseX > 100 && mouseX < 200 && mouseY > 400 && currentYear > 0) {
      currentYear--;
    }

    // Check if "Next" button is pressed
    if (mouseX > 600 && mouseX < 700 && mouseY > 400 && currentYear < (amortizationSchedule.length / monthsPerPage) - 1) {
      currentYear++;
    }
  }
}

// Function to detect key presses
function keyPressed() {
  // Press 'R' to return to the calculator screen and reset the page
  if (key === 'R' || key === 'r') {
    showSchedule = false;  // Return to calculator screen
    currentYear = 0;  // Reset pagination to the first page
    errorMessage = "";  // Clear any error messages
  }
}

// Function to calculate amortization schedule based on input data
function calculateAmortizationSchedule() {
  let months = loanTerm;  // Loan term is in months
  let interestPerPeriod = (interestRate / 100) / compoundingPeriods;  // Interest per compounding period
  let schedule = new Array(months).fill().map(() => new Array(4).fill(0));  // Principal, Interest, Total Payment, Balance
  let remainingBalance = loanAmount;
  
  if (amortizationType === "Fixed") {
    // Fixed amortization: equal monthly payments
    let monthlyPayment = loanAmount * (interestPerPeriod / (1 - pow(1 + interestPerPeriod, -months)));
    
    for (let i = 0; i < months; i++) {
      let interestPayment = remainingBalance * interestPerPeriod;
      let principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      schedule[i][0] = principalPayment;
      schedule[i][1] = interestPayment;
      schedule[i][2] = monthlyPayment;
      schedule[i][3] = max(remainingBalance, 0);  // Remaining balance shouldn't go below zero
    }
    
  } else if (amortizationType === "Interest-Only") {
    let interestPayment = loanAmount * interestPerPeriod;
    
    for (let i = 0; i < months - 1; i++) {
      schedule[i][0] = 0;  // No principal paid
      schedule[i][1] = interestPayment;
      schedule[i][2] = interestPayment;
      schedule[i][3] = loanAmount;
    }
    
    schedule[months - 1][0] = loanAmount;  // Pay off the principal in the last month
    schedule[months - 1][1] = interestPayment;
    schedule[months - 1][2] = loanAmount + interestPayment;
    schedule[months - 1][3] = 0;  // Loan fully repaid
    
  } else if (amortizationType === "Balloon") {
    let adjustedLoanAmount = loanAmount - balloonAmount;
    let monthlyPayment = adjustedLoanAmount * (interestPerPeriod / (1 - pow(1 + interestPerPeriod, -(months - 1))));

    for (let i = 0; i < months - 1; i++) {
        let interestPayment = remainingBalance * interestPerPeriod;
        let principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;

        schedule[i][0] = principalPayment;
        schedule[i][1] = interestPayment;
        schedule[i][2] = monthlyPayment;
        schedule[i][3] = max(remainingBalance, 0);
    }

    let finalInterestPayment = remainingBalance * interestPerPeriod;
    schedule[months - 1][0] = balloonAmount;
    schedule[months - 1][1] = finalInterestPayment;
    schedule[months - 1][2] = balloonAmount + finalInterestPayment;
    schedule[months - 1][3] = 0;
  }
  
  return schedule;
}
