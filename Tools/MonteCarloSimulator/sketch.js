// Variables for user inputs
let initialInvestment = 100000;
let annualSavings = 10000;
let expectedReturn = 0.07;
let inflationRate = 0.02;
let stdDeviationReturn = 0.15;
let stdDeviationInflation = 0.01;
let stdDeviationSavings = 0.05;
let years = 30;
let iterations = 50;

let results;
let finalValues;

// Variables for input fields
let labels = [
  "Initial Investment:", "Annual Savings:", "Expected Return (%):", "Inflation Rate (%):",
  "Std Dev (Return (%)):", "Std Dev (Inflation (%)):", "Std Dev (Savings ($)):", "Years:", "Iterations:"
];
let inputs = ["100000", "10000", "7", "2", "15", "1", "1000", "30", "100"];
let selectedInput = -1;

let graphY = 150;

// Setup function for p5.js
function setup() {
  createCanvas(1200, 800);
  results = Array.from({ length: iterations }, () => Array(years + 1).fill(0));
  finalValues = Array(iterations).fill(0);
  runMonteCarlo();
}

// Monte Carlo simulation function
function runMonteCarlo() {
    // Parse and validate user inputs
    
    initialInvestment = max(0, parseFloat(inputs[0]));  // Allow 0
    annualSavings = max(0, parseFloat(inputs[1]));
    expectedReturn = max(0, parseFloat(inputs[2]) / 100);  
    inflationRate = max(0, parseFloat(inputs[3]) / 100);  
  
    stdDeviationReturn = max(0, parseFloat(inputs[4]) / 100);
    stdDeviationInflation = max(0, parseFloat(inputs[5]) / 100); 
    stdDeviationSavings = max(0, parseFloat(inputs[6]) / 100);   
  
    // Validate and set years (min 1)
    years = max(1, parseInt(inputs[7]));  
    if (parseInt(inputs[7]) < 1) {
      inputs[7] = '1';  // Update the input box to display 1
    }
  
    // Validate and set iterations (min 10)
    iterations = max(10, parseInt(inputs[8]));  
    if (parseInt(inputs[8]) < 10) {
      inputs[8] = '10';  // Update the input box to display 10
    }
  
    // Reset the results and final values based on the validated inputs
    results = Array.from({ length: iterations }, () => Array(years + 1).fill(0));
    finalValues = Array(iterations).fill(0);
  
    for (let i = 0; i < iterations; i++) {
      let balance = initialInvestment;
      results[i][0] = balance;
  
      for (let year = 1; year <= years; year++) {
        let yearlyReturn = randomGaussian() * stdDeviationReturn + expectedReturn;
        let yearlyInflation = randomGaussian() * stdDeviationInflation + inflationRate;
        let yearlySavings = randomGaussian() * stdDeviationSavings + annualSavings;
  
        balance = balance * (1 + yearlyReturn - yearlyInflation) + yearlySavings;
        results[i][year] = balance;
      }
  
      finalValues[i] = balance;
    }
  }
  

// Draw function to display everything
function draw() {
  background(255);

  // Title
  fill(0);
  noStroke();  // Remove stroke to avoid black outline
  textAlign(CENTER);
  textSize(24);  //  text size for title
  text("Monte Carlo Financial Projection", width / 2, 30);
  fill(100, 0, 0);
  textSize(10);
  text("Click on a Box to Change the Input", width / 2, 110);
  fill(0);

  // Draw input fields across the top
  drawInputFields();

  // Draw the Monte Carlo projections graph
  drawGraph();

  // Display summary statistics
  drawSummary();
}

// Function to draw input fields for user interaction (across the top)
function drawInputFields() {
    fill(0);
    textSize(10);  // Adjust text size for input labels
    textAlign(LEFT);
    noStroke();  // Ensure no outline for the text
  
    let boxWidth = 100;
    let boxHeight = 25;
    let labelY = 80;  // Set consistent Y position for all labels
    let xOffset = 20;
    let xSpacing = boxWidth + 30;
  
    for (let i = 0; i < labels.length; i++) {
      let x = xOffset + i * xSpacing;
      
      // Handle wrapping to the second line if input boxes exceed width
      if (x + boxWidth > width - 20) {
        x = xOffset + (i - labels.length / 2) * xSpacing;
        labelY = 120;  // Move labels to second row
      }
  
      // Draw labels and input boxes
      noStroke();  // No outline for text
      textSize(12);
      textAlign(CENTER);
      text(labels[i], x + boxWidth / 2, labelY - 15);
      
      stroke(0);  // Outline for input boxes only
      noFill();  // No fill inside the input boxes
      rect(x, labelY, boxWidth, boxHeight);
  
      // Draw the input value inside the box
      textSize(14);
      fill(0);
      noStroke();  // No outline for the text inside the box
      textAlign(CENTER);
      text(inputs[i], x + boxWidth / 2, labelY + (boxHeight / 3) - 2);
      textAlign(LEFT);  // Reset text alignment
    }
  }
  

// Function to draw the Monte Carlo projections graph with axes
function drawGraph() {
  stroke(0, 0, 255, 25);
  noFill();

  let graphX = 100;
  let graphYTop = 150;
  let graphWidth = width - 100;
  let graphHeight = height - 250;
  let xSpacing = graphWidth / (years + 1);
  let yMax = max(finalValues) * 1.1;

  // Draw Monte Carlo projection lines
  for (let i = 0; i < iterations; i++) {
    beginShape();
    for (let year = 0; year <= years; year++) {
      let x = graphX + year * xSpacing;
      let y = map(results[i][year], 0, yMax, graphYTop + graphHeight, graphYTop);
      vertex(x, y);
    }
    endShape();
  }

  // Calculate and draw the median line
  let medianValues = Array(years + 1).fill(0);
  for (let year = 0; year <= years; year++) {
    let yearValues = results.map(r => r[year]);
    medianValues[year] = calculateMedian(yearValues);
  }

  // Draw the median line
  stroke(255, 0, 0);
  strokeWeight(2);
  beginShape();
  for (let year = 0; year <= years; year++) {
    let x = graphX + year * xSpacing;
    let y = map(medianValues[year], 0, yMax, graphYTop + graphHeight, graphYTop);
    vertex(x, y);
  }
  endShape();

  // Reset stroke for axes and labels
  stroke(0);
  strokeWeight(1);
  line(graphX, graphYTop, graphX, graphYTop + graphHeight);  // y-axis
  line(graphX, graphYTop + graphHeight, graphX + graphWidth, graphYTop + graphHeight);  // x-axis

  // Draw y-axis labels
  let numYLabels = 10;
  for (let i = 0; i <= numYLabels; i++) {
    let yValue = i * yMax / numYLabels;
    let y = map(yValue, 0, yMax, graphYTop + graphHeight, graphYTop);
    fill(0);
    textAlign(RIGHT, CENTER);
    text("$" + nf(yValue, 0, 0), graphX - 10, y);
    stroke(200);
    line(graphX, y, graphX + graphWidth, y);  // Horizontal grid lines
  }

  // Draw x-axis labels (Years)
  for (let year = 0; year <= years; year++) {
    let x = graphX + year * xSpacing;
    fill(0);
    textAlign(CENTER, TOP);
    text(year, x, graphYTop + graphHeight + 5);
  }
}

// Function to display summary statistics
function drawSummary() {
  fill(0);
  textAlign(LEFT);
  textSize(16);

  let median = calculateMedian(finalValues);
  let bestCase = max(finalValues);
  let worstCase = min(finalValues);
  let meanValue = calculateMean(finalValues);
  let stdDevValue = calculateStandardDeviation(finalValues, meanValue);
  let twentyFifthPercentile = calculatePercentile(finalValues, 25);
  let seventyFifthPercentile = calculatePercentile(finalValues, 75);

  text("Median Portfolio Value: $" + nf(median, 1, 2), 50, height - 50);
  text("Mean Portfolio Value: $" + nf(meanValue, 1, 2), 50, height - 20);
  text("25th Percentile: $" + nf(twentyFifthPercentile, 1, 2), 350, height - 50);
  text("75th Percentile: $" + nf(seventyFifthPercentile, 1, 2), 350, height - 20);
  text("Best Case Scenario: $" + nf(bestCase, 1, 2), 650, height - 50);
  text("Worst Case Scenario: $" + nf(worstCase, 1, 2), 650, height - 20);
  text("Standard Deviation: $" + nf(stdDevValue, 1, 2), 950, height - 50);
}

// Helper function to calculate the mean (average)
function calculateMean(values) {
  let sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

// Helper function to calculate the standard deviation
function calculateStandardDeviation(values, mean) {
  let sumSquares = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return sqrt(sumSquares / values.length);
}

// Helper function to calculate a percentile
function calculatePercentile(values, percentile) {
  let sorted = [...values].sort((a, b) => a - b);
  let index = int(percentile / 100 * sorted.length);
  return sorted[index];
}

// Helper function to calculate the median
function calculateMedian(values) {
  let sorted = [...values].sort((a, b) => a - b);
  if (sorted.length % 2 === 0) {
    return (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  } else {
    return sorted[sorted.length / 2];
  }
}

// Handle mouse clicks to open input dialogue boxes
function mousePressed() {
  let boxWidth = 100;
  let boxHeight = 25;
  let labelY = 80;
  let xOffset = 20;
  let xSpacing = boxWidth + 30;

  for (let i = 0; i < labels.length; i++) {
    let x = xOffset + i * xSpacing;

    if (x + boxWidth > width - 20) {
      x = xOffset + (i - labels.length / 2) * xSpacing;
      labelY = 120;
    }

    if (mouseX > x && mouseX < x + boxWidth && mouseY > labelY && mouseY < labelY + boxHeight) {
      selectedInput = i;
      let inputValue = prompt("Enter new value for " + labels[i] + ":");
      if (inputValue !== null) {
        inputs[i] = inputValue;
        runMonteCarlo();  // Re-run the simulation with updated inputs
      }
    }
  }
}
