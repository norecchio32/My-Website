let underlyingPrice, exercisePrice, daysToExpiration, interestRate, dividendYield, volatility;
let callPrice, putPrice, callDelta, putDelta, gamma, vega, callTheta, putTheta, callRho, putRho;
let errorMessage = '';

function setup() {
  // Increase canvas size
  createCanvas(600, 600);
  
  textSize(18);  // Increase text size

  // Add title to the center
  textAlign(CENTER);
  text('Options Calculator', width / 2, 40);

  // Adjust positions for the inputs with better spacing and size
  underlyingPrice = createInput('100').position(100, 100).size(100);
  exercisePrice = createInput('100').position(100, 150).size(100);
  daysToExpiration = createInput('30').position(100, 200).size(100);
  interestRate = createInput('5').position(100, 250).size(100);
  dividendYield = createInput('1').position(100, 300).size(100);
  volatility = createInput('25').position(100, 350).size(100);

  // Create a button to calculate
  let button = createButton('Calculate').position(100, 400).size(100);
  button.mousePressed(calculateOptionsPrice);
}

function draw() {
  background(220);
  
  // Add title again to ensure it's on top
  textAlign(CENTER);
  textSize(24);
  text('Options Calculator', width / 2, 40);
  
  // Adjust the text positions for better spacing and size
  textAlign(LEFT);
  textSize(16);
  text('Underlying Price', 100, 90);
  text('Exercise Price', 100, 140);
  text('Days Until Expiration', 100, 190);
  text('Interest Rate (%)', 100, 240);
  text('Dividend Yield (%)', 100, 290);
  text('Volatility (%)', 100, 340);
  
  textSize(16);
  if (errorMessage !== '') {
    text(errorMessage, 300, 100);  // Display any error messages
  } else if (callPrice) {
    // Display the results with more space and larger text
    text('Call Option:', 300, 120);
    text('Theoretical Price: ' + nf(callPrice, 1, 3), 300, 140);
    text('Delta: ' + nf(callDelta, 1, 3), 300, 160);
    text('Gamma: ' + nf(gamma, 1, 3), 300, 180);
    text('Vega: ' + nf(vega, 1, 3), 300, 200);
    text('Theta: ' + nf(callTheta, 1, 3), 300, 220);
    text('Rho: ' + nf(callRho, 1, 3), 300, 240);
    
    text('Put Option:', 300, 300);
    text('Theoretical Price: ' + nf(putPrice, 1, 3), 300, 320);
    text('Delta: ' + nf(putDelta, 1, 3), 300, 340);
    text('Gamma: ' + nf(gamma, 1, 3), 300, 360);
    text('Vega: ' + nf(vega, 1, 3), 300, 380);
    text('Theta: ' + nf(putTheta, 1, 3), 300, 400);
    text('Rho: ' + nf(putRho, 1, 3), 300, 420);
  }
}

function calculateOptionsPrice() {
  // Reset error message and prices
  errorMessage = '';
  resetValues();

  try {
    // Convert input values to numbers
    let S = float(underlyingPrice.value());
    let K = float(exercisePrice.value());
    let T = float(daysToExpiration.value()) / 365.0;
    let r = float(interestRate.value()) / 100.0;
    let q = float(dividendYield.value()) / 100.0;
    let sigma = float(volatility.value()) / 100.0;

    // Check if any of the inputs are invalid
    if (isNaN(S) || isNaN(K) || isNaN(T) || isNaN(r) || isNaN(q) || isNaN(sigma) || T <= 0 || sigma <= 0) {
      throw 'Invalid input values!';
    }

    // Black-Scholes formula calculations
    let d1 = (log(S / K) + (r - q + sigma * sigma / 2) * T) / (sigma * sqrt(T));
    let d2 = d1 - sigma * sqrt(T);

    // Cumulative distribution function for normal distribution
    let N = normDist(d1);
    let Nd2 = normDist(d2);

    // Call and Put option prices
    callPrice = S * exp(-q * T) * N - K * exp(-r * T) * Nd2;
    putPrice = K * exp(-r * T) * normDist(-d2) - S * exp(-q * T) * normDist(-d1);

    // If theoretical price is less than or equal to 0, show an error message
    if (callPrice <= 0 || putPrice <= 0) {
      throw 'Theoretical price is too low or negative: check input values!';
    }

    // Option Greeks
    callDelta = exp(-q * T) * N;
    putDelta = callDelta - exp(-q * T);

    gamma = exp(-q * T) * normDistPrime(d1) / (S * sigma * sqrt(T));

    vega = S * exp(-q * T) * normDistPrime(d1) * sqrt(T) / 100;

    callTheta = (-S * sigma * exp(-q * T) * normDistPrime(d1) / (2 * sqrt(T)) 
                 - r * K * exp(-r * T) * normDist(d2)) / 365;
    putTheta = (-S * sigma * exp(-q * T) * normDistPrime(d1) / (2 * sqrt(T)) 
                + r * K * exp(-r * T) * normDist(-d2)) / 365;

    callRho = K * T * exp(-r * T) * normDist(d2) / 100;
    putRho = -K * T * exp(-r * T) * normDist(-d2) / 100;

  } catch (err) {
    // Catch any errors and show an error message
    errorMessage = 'Error: ' + err;
    resetValues(); // Clear outputs in case of error
  }
}

function resetValues() {
  callPrice = putPrice = callDelta = putDelta = gamma = vega = callTheta = putTheta = callRho = putRho = null;
}

// Normal distribution cumulative density function
function normDist(x) {
  return 0.5 * (1 + erf(x / sqrt(2)));
}

// Normal distribution probability density function
function normDistPrime(x) {
  return exp(-0.5 * x * x) / sqrt(2 * PI);
}

// Error function approximation
function erf(x) {
  let sign = (x >= 0) ? 1 : -1;
  x = abs(x);

  let a1 =  0.254829592;
  let a2 = -0.284496736;
  let a3 =  1.421413741;
  let a4 = -1.453152027;
  let a5 =  1.061405429;
  let p  =  0.3275911;

  let t = 1.0 / (1.0 + p * x);
  let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * exp(-x * x);

  return sign * y;
}
