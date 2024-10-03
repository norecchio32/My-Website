let benchMaxInput, squatMaxInput, deadliftMaxInput;
let page = 0;
let workoutData;
let inputFields = [];
let calculateButton;

function setup() {
  createCanvas(900, 600); // Larger canvas

  // Inputs for 1 rep maxes (no unit specified)
  benchMaxInput = createInput();
  benchMaxInput.position(width / 2 - benchMaxInput.width / 2, 110);
  benchMaxInput.attribute('placeholder', 'Bench Press 1RM');
  benchMaxInput.style('text-align', 'center'); // Center the text
  inputFields.push(benchMaxInput);
  
  squatMaxInput = createInput();
  squatMaxInput.position(width / 2 - squatMaxInput.width / 2, 180);
  squatMaxInput.attribute('placeholder', 'Squat 1RM');
  squatMaxInput.style('text-align', 'center'); // Center the text
  inputFields.push(squatMaxInput);
  
  deadliftMaxInput = createInput();
  deadliftMaxInput.position(width / 2 - deadliftMaxInput.width / 2, 250);
  deadliftMaxInput.attribute('placeholder', 'Deadlift 1RM');
  deadliftMaxInput.style('text-align', 'center'); // Center the text
  inputFields.push(deadliftMaxInput);
  
  createCalculateButton(); // Function to create the button
}

function createCalculateButton() {
  // Button to calculate workout plan
  calculateButton = createButton('Calculate Workout Plan');
  calculateButton.position(width / 2 - calculateButton.width / 2, 320);
  calculateButton.mousePressed(generateWorkouts);
}

function generateWorkouts() {
  let benchMax = benchMaxInput.value();
  let squatMax = squatMaxInput.value();
  let deadliftMax = deadliftMaxInput.value();
  
  if (benchMax && squatMax && deadliftMax) {
    // Generate the workout plan based on 1RM inputs
    workoutData = {
      chestTriceps: generateChestTricepsWorkouts(benchMax),
      legs: generateLegsWorkouts(squatMax),
      backBiceps: generateBackBicepsWorkouts(deadliftMax)
    };
    page = 1;

    // Hide input fields and calculate button after calculation
    for (let i = 0; i < inputFields.length; i++) {
      inputFields[i].hide();
    }
    calculateButton.hide();
  } else {
    alert('Please fill out all fields');
  }
}

function draw() {
  background(240);

  if (page === 0) {
    textSize(24);
    textAlign(CENTER);
    text('Custom Workout Calculator', width / 2, 50);
    textSize(16);
    textAlign(LEFT);
    text('Bench Press', width / 2 - 90, 100);
    text('Squat', width / 2 - 90, 170);
    text('Deadlift', width / 2 - 90, 240);
    
    // Ensure that calculate button is shown on the input page
    calculateButton.show();
    
    // Show the input fields when on the input page
    for (let i = 0; i < inputFields.length; i++) {
      inputFields[i].show();
    }
  } else {
    // Hide the calculate button on the results page
    calculateButton.hide();
    
    // Hide input fields on the results page
    for (let i = 0; i < inputFields.length; i++) {
      inputFields[i].hide();
    }
  }

  if (page === 1) {
    displayWorkouts('Chest & Triceps Workouts', workoutData.chestTriceps);
  } else if (page === 2) {
    displayWorkouts('Leg Workouts', workoutData.legs);
  } else if (page === 3) {
    displayWorkouts('Back & Biceps Workouts', workoutData.backBiceps);
  }

  // Display instructions to reset
  if (page > 0) {
    textSize(16);
    fill(0);
    text('Press "r" to return to the calculator inputs', 300, 580);
  }

  // Check if user presses 'r' to reset to input page
  if (keyIsPressed && key === 'r') {
    resetCalculator();
  }
}

function displayWorkouts(title, workouts) {
  textSize(24);
  textAlign(CENTER);
  text(title, width / 2, 50);
  textSize(16);
  textAlign(LEFT);

  // Display the first 3 workouts on the left and next 3 on the right
  let xOffset1 = 50;
  let xOffset2 = 450;
  let yOffset = 100;
  
  for (let i = 0; i < workouts.length; i++) {
    let xPos = (i < 3) ? xOffset1 : xOffset2;
    let yPos = yOffset + (i % 3) * 120;
    
    text(workouts[i].name, xPos, yPos);
    
    // Display 3x4 grid for sets, reps, and weights
    for (let j = 0; j < 4; j++) {
      let set = workouts[i].sets[j];
      text(`Set ${set.set}: Reps ${set.reps}, Weight ${set.weight.toFixed(1)}`, xPos + 50, yPos + 20 + j * 20);
    }
  }

  // Navigation buttons
  if (page > 1) {
    let prevButton = createButton('Previous');
    prevButton.position(150, 550);
    prevButton.mousePressed(() => {
      if (page > 1) page--;
    });
  }

  if (page < 3) {
    let nextButton = createButton('Next');
    nextButton.position(650, 550);
    nextButton.mousePressed(() => {
      if (page < 3) page++;
    });
  }
}

function resetCalculator() {
  // Reset to the input screen (page 0)
  page = 0;

  // Show input fields and calculate button again when returning to the input screen
  for (let i = 0; i < inputFields.length; i++) {
    inputFields[i].show();
  }

  // Ensure the calculate button is shown again
  calculateButton.show();

  // Clear any navigation buttons from the results page
  clearButtons();
}

function clearButtons() {
  let buttons = selectAll('button');
  for (let i = 0; i < buttons.length; i++) {
    // Only remove 'Previous' and 'Next' buttons, ensure the 'Calculate' button is not removed
    if (buttons[i].html() === 'Previous' || buttons[i].html() === 'Next') {
      buttons[i].remove();
    }
  }
}

function generateChestTricepsWorkouts(benchMax) {
  return [
    generateWorkout('Bench Press', benchMax, [0.65, 0.70, 0.75, 0.80], [8, 6, 6, 4]),
    generateWorkout('Tricep Pulldown', benchMax * 0.4, [0.5, 0.55, 0.60, 0.65], [12, 10, 10, 8]),
    generateWorkout('Dumbbell Flys', benchMax * 0.3, [0.45, 0.50, 0.55, 0.60], [10, 8, 8, 6]),
    generateWorkout('Incline Bench Press', benchMax * 0.7, [0.65, 0.70, 0.75, 0.80], [8, 6, 6, 4]),
    generateWorkout('Dips', benchMax * 0.35, [0.4, 0.45, 0.5, 0.55], [12, 10, 10, 8]),
    generateWorkout('Skull Crushers', benchMax * 0.3, [0.4, 0.45, 0.5, 0.55], [10, 8, 8, 6])
  ];
}

function generateLegsWorkouts(squatMax) {
  return [
    generateWorkout('Squat', squatMax, [0.65, 0.70, 0.75, 0.80], [8, 6, 6, 4]),
    generateWorkout('Bulgarian Split Squats', squatMax * 0.5, [0.55, 0.60, 0.65, 0.70], [10, 8, 8, 6]),
    generateWorkout('Leg Press', squatMax * 0.7, [0.6, 0.65, 0.7, 0.75], [12, 10, 10, 8]),
    generateWorkout('Lunges', squatMax * 0.4, [0.5, 0.55, 0.6, 0.65], [12, 10, 10, 8]),
    generateWorkout('Romanian Deadlifts', squatMax * 0.6, [0.65, 0.7, 0.75, 0.8], [10, 8, 8, 6]),
    generateWorkout('Calf Raises', squatMax * 0.3, [0.35, 0.4, 0.45, 0.5], [20, 15, 15, 12])
  ];
}

function generateBackBicepsWorkouts(deadliftMax) {
  return [
    generateWorkout('Deadlift', deadliftMax, [0.65, 0.70, 0.75, 0.80], [8, 6, 6, 4]),
    generateWorkout('Cable Row', deadliftMax * 0.6, [0.55, 0.6, 0.65, 0.7], [10, 8, 8, 6]),
    generateWorkout('Dumbbell Row', deadliftMax * 0.3, [0.5, 0.55, 0.6, 0.65], [12, 10, 10, 8]),
    generateWorkout('Lat Pulldown', deadliftMax * 0.35, [0.45, 0.5, 0.55, 0.6], [12, 10, 10, 8]),
    generateWorkout('Face Pulls', deadliftMax * 0.3, [0.4, 0.45, 0.5, 0.55], [12, 10, 10, 8]),
    generateWorkout('Dumbbell Curls', deadliftMax * 0.2, [0.25, 0.3, 0.35, 0.4], [12, 10, 10, 8])
  ];
}

function generateWorkout(name, maxWeight, multipliers, reps) {
  let sets = [];
  for (let i = 0; i < 4; i++) {
    sets.push({
      set: i + 1,
      reps: reps[i],
      weight: maxWeight * multipliers[i]
    });
  }
  return {
    name: name,
    sets: sets
  };
}
