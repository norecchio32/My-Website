let cardImages;  // 4x13 array to store card images (4 suits, 13 ranks)
let suits = ["hearts", "diamonds", "clubs", "spades"];
let ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
let logo, rules;

let playerHand = [];
let dealerHand = [];
let playerScore = 0, dealerScore = 0;
let bet = 0, balance = 1000;  // Starting balance
let gameActive = false, playerTurn = true, gameEnd = false;
let showDealerCard = false;
let insuranceAvailable = false, insuranceBought = false;
let playerBlackjack = false, dealerBlackjack = false;
let canDoubleDown = true;  // Can double down if it's the player's first two cards
let payoutMessage = "";  // Stores the message showing payout
let lastPayout = 0;  // Stores the payout for the current round

function setup() {
    createCanvas(800, 600);
    cardImages = [];
    for (let i = 0; i < 4; i++) {
      cardImages[i] = [];
    }
    
    loadCardImages();  // Load all card images into the array
    logo = loadImage('assets/blackjacklogo.png');  // Load the blackjack logo image
    rules = loadImage('assets/bjrules.png');       // Load the blackjack rules image
  
    resetGame();
}  

function draw() {
  background(0, 100, 0);  // Green table background
  image(logo, (width - logo.width), 10); // Logo
  logo.resize(200, 200);
  image(rules, width / 2 - 150, height / 2 - 300);
  rules.resize(300, 200);

  // Show balance and betting options
  fill(0, 100);
  rect(10, 10, 200, 75);
  textAlign(LEFT);
  fill(255);
  textSize(26);
  text("Balance: $" + balance, 20, 40);
  textSize(23);
  text("Bet: $" + bet, 20, 70);
  textAlign(CENTER);
  textSize(20);

  if (!gameActive) {
    drawBettingButtons();
  } else {
    // Show dealer's hand
    showHand(dealerHand, 20, 100, !showDealerCard);  // Hide dealer's second card during the round
    textSize(20);
    text("Dealer's Score: " + (showDealerCard ? dealerScore : "?"), 100, 280);

    // Show player's hand
    showHand(playerHand, 20, 300, false);
    textSize(20);
    text("Player's Score: " + playerScore, 100, 480);

    // Display payout message if available
    if (payoutMessage !== "") {
      textSize(24);
      fill(255, 223, 0);  // Yellow text for payout message
      text(payoutMessage, width / 2, height - 50);  // Display message at the bottom
    }

    if (gameEnd) {
      textSize(24);
      text("Press 'R' to reset the table", 400, height - 10);
    } else {
      if (playerTurn && !insuranceAvailable) {
        if (canDoubleDown && playerHand.length === 2) {
          drawHitStandDoubleDownButtons();  // Offer the player the chance to double down after 2 cards
        } else if (playerScore < 21) {
          drawHitStandButtons();  // Standard hit/stand buttons if double down is no longer available
        }
      }
      if (insuranceAvailable) {
        drawInsuranceButtons();
      }
    }
  }
}

function mousePressed() {
  if (!gameActive) {
    handleBetting();
  } else if (insuranceAvailable && !insuranceBought) {
    handleInsurance();
  } else if (playerTurn) {
    handleHitStand();
  }
}

function keyPressed() {
  if (key === 'R' || key === 'r') {
    if (gameEnd) {
      resetGame();
    }
  }
}

function loadCardImages() {
    for (let i = 0; i < 4; i++) {
      for (let j = 12; j >= 0; j--) {
        cardImages[i][j] = loadImage('assets/' + ranks[j] + '_of_' + suits[i] + '.png');
      }
    }
}
  

function drawBettingButtons() {
  fill(0, 150, 0);
  rect(width / 2 - 150, 500, 100, 25);  // Bet button
  fill(255);
  text("Bet + $10", width / 2 - 100, 520);

  fill(100, 0, 0);
  rect(width / 2 - 150, 525, 100, 25);  // Decrease bet button
  fill(255);
  text("Bet - $10", width / 2 - 100, 545);

  fill(0, 0, 100);
  rect(width / 2 + 50, 500, 100, 50);  // Start button
  fill(255);
  text("Deal", width / 2 + 100, 530);
}

function drawHitStandButtons() {
  fill(0, 0, 100);
  rect(width / 2 - 150, 500, 100, 50);  // Hit button
  fill(255);
  text("Hit", width / 2 - 100, 530);

  fill(0, 0, 100);
  rect(width / 2 + 50, 500, 100, 50);  // Stand button
  fill(255);
  text("Stand", width / 2 + 100, 530);
}

function drawHitStandDoubleDownButtons() {
  drawHitStandButtons();  // Hit/Stand buttons

  fill(50, 0, 100);  // Draw Double Down button
  rect(25, 525, 100, 50);
  fill(255);
  textSize(16);
  text("Double Down", 75, 555);
}

function drawInsuranceButtons() {
  fill(0, 0, 100);  // Buy insurance button
  rect(width / 2 - 150, 500, 100, 50);
  fill(255);
  text("Insurance?", width / 2 - 100, 530);

  fill(0, 0, 100);  // Decline insurance button
  rect(width / 2 + 50, 500, 100, 50);
  fill(255);
  text("No Thanks", width / 2 + 100, 530);
}

function resetGame() {
  playerHand = [];
  dealerHand = [];
  playerScore = 0;
  dealerScore = 0;
  showDealerCard = false;
  playerTurn = true;
  gameEnd = false;
  gameActive = false;
  insuranceAvailable = false;
  insuranceBought = false;
  payoutMessage = "";  // Clear the payout message for the new round
  lastPayout = 0;  // Reset payout for the next round
  bet = 0;  // Bet resets when the round is reset
  canDoubleDown = true;  // Reset the ability to double down
}

function startGame() {
  playerHand = [];
  dealerHand = [];
  playerScore = 0;
  dealerScore = 0;
  showDealerCard = false;
  playerTurn = true;
  gameEnd = false;
  insuranceAvailable = false;
  insuranceBought = false;
  payoutMessage = "";  // Clear the payout message
  lastPayout = 0;  // Reset payout
  gameActive = true;
  canDoubleDown = true;

  // Deal two cards to player and dealer
  hit(playerHand);
  hit(playerHand);
  hit(dealerHand);
  hit(dealerHand);

  playerScore = calculateScore(playerHand);
  dealerScore = calculateScore(dealerHand);

  if (playerScore === 21 && playerHand.length === 2) {
    handlePlayerBlackjack();
    return;
  }

  if (dealerHand[0].rank === 12) {
    insuranceAvailable = true;
    return;
  }

  checkDealerBlackjack();
}

function handlePlayerBlackjack() {
  if (dealerHand[0].rank === 12 && calculateScore(dealerHand) === 21) {
    payoutMessage = "Push! Both have Blackjack!";
  } else {
    payoutMessage = "Blackjack! You won $" + (2.5 * bet) + "!";
    balance += 2.5 * bet;
    lastPayout = 2.5 * bet;
  }
  gameEnd = true;
  showDealerCard = true;
}

function checkDealerBlackjack() {
  if (dealerScore === 21) {
    showDealerCard = true;
    if (insuranceBought) {
      payoutMessage = "Dealer has Blackjack! Insurance pays 2:1.";
      balance += bet;
    } else {
      payoutMessage = "Dealer has Blackjack! You lose.";
    }
    gameEnd = true;
  }
}

function hit(hand) {
  let suit = floor(random(4));
  let rank = floor(random(13));
  hand.push(new Card(suit, rank));
}

function handleBetting() {
  if (mouseX > width / 2 - 150 && mouseX < width / 2 - 50 && mouseY > 500 && mouseY < 525) {
    if (balance >= 10) {
      bet += 10;
      balance -= 10;
    }
  } else if (mouseX > width / 2 - 150 && mouseX < width / 2 - 50 && mouseY > 525 && mouseY < 550) {
    if (bet >= 10) {
      bet -= 10;
      balance += 10;
    }
  } else if (mouseX > width / 2 + 50 && mouseX < width / 2 + 150 && mouseY > 500 && mouseY < 550) {
    if (bet > 0) {
      startGame();
    }
  }
}

function handleInsurance() {
  if (mouseX > width / 2 - 150 && mouseX < width / 2 - 50 && mouseY > 500 && mouseY < 550) {
    buyInsurance();
    checkDealerBlackjack();
  } else if (mouseX > width / 2 + 50 && mouseX < width / 2 + 150 && mouseY > 500 && mouseY < 550) {
    insuranceAvailable = false;
    checkDealerBlackjack();
  }
}

function handleHitStand() {
  if (mouseX > width / 2 - 150 && mouseX < width / 2 - 50 && mouseY > 500 && mouseY < 550) {
    hit(playerHand);
    playerScore = calculateScore(playerHand);
    canDoubleDown = false;
    if (playerScore >= 21) {
      playerTurn = false;
      if (playerScore > 21) {
        playerBust();
      } else {
        dealerLogic();
      }
    }
  } else if (mouseX > width / 2 + 50 && mouseX < width / 2 + 150 && mouseY > 500 && mouseY < 550) {
    playerTurn = false;
    dealerLogic();
  } else if (canDoubleDown && mouseX > 25 && mouseX < 125 && mouseY > 525 && mouseY < 575) {
    doubleDown();
  }
}

function dealerLogic() {
  showDealerCard = true;
  while (dealerScore < 17) {
    hit(dealerHand);
    dealerScore = calculateScore(dealerHand);
  }

  if (dealerScore > 21) {
    payoutMessage = "Dealer busts! You win $" + (2 * bet) + "!";
    balance += 2 * bet;
    lastPayout = 2 * bet;
  } else if (dealerScore > playerScore) {
    payoutMessage = "Dealer wins.";
  } else if (dealerScore === playerScore) {
    payoutMessage = "Push! It's a tie.";
    balance += bet;
  } else {
    payoutMessage = "You win $" + (2 * bet) + "!";
    balance += 2 * bet;
    lastPayout = 2 * bet;
  }

  gameEnd = true;
}

function playerBust() {
  payoutMessage = "You bust! Dealer wins.";
  gameEnd = true;
}

function calculateScore(hand) {
  let score = 0;
  let aceCount = 0;

  for (let c of hand) {
    let rank = c.rank;

    if (rank >= 9 && rank < 12) {
      score += 10;
    } else if (rank === 12) {
      score += 11;
      aceCount++;
    } else {
      score += rank + 2;
    }
  }

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

function buyInsurance() {
  if (balance >= bet / 2) {
    balance -= bet / 2;
    insuranceBought = true;
    insuranceAvailable = false;
  }
}

function doubleDown() {
  if (balance >= bet) {
    balance -= bet;
    bet *= 2;
    hit(playerHand);
    playerScore = calculateScore(playerHand);
    canDoubleDown = false;
    playerTurn = false;
    if (playerScore > 21) {
      playerBust();
    } else {
      dealerLogic();
    }
  }
}

function showHand(hand, x, y, hideSecondCard) {
  for (let i = 0; i < hand.length; i++) {
    let c = hand[i];
    if (i === 1 && hideSecondCard) {
      fill(0);
      rect(x + i * 120, y, 100, 150);
    } else {
      image(cardImages[c.suit][c.rank], x + i * 120, y, 100, 150);
    }
  }
}

class Card {
  constructor(s, r) {
    this.suit = s;
    this.rank = r;
  }
}