/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

const shuffleCards = (includeJokers = false) => {
  /* Return an array of 52 cards (if jokers is false, 54 otherwise). Carefully follow the instructions in the README */
  let cards = [];
  ["spades", "clubs", "hearts", "diamonds"].forEach((suit) => {
    ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"].forEach(
      (value) => {
        cards.push({ suit: suit, value: value });
      }
    );
  });
  // Add in jokers here
  if (includeJokers) {
    /*...*/
  }
  // Now shuffle
  let deck = [];
  while (cards.length > 0) {
    // Find a random number between 0 and cards.length - 1
    const index = Math.floor(Math.random() * cards.length);
    deck.push(cards[index]);
    cards.splice(index, 1);
  }
  return deck;
};

const initialState = () => {
  /* Use the above function.  Generate and return an initial state for a game */
  let state = {
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: [],
  };

  // Get the shuffled deck and distribute it to the players
  const deck = shuffleCards(false);
  // Setup the piles
  for (let i = 1; i <= 7; ++i) {
    let card = deck.splice(0, 1)[0];
    card.up = true;
    state[`pile${i}`].push(card);
    for (let j = i + 1; j <= 7; ++j) {
      card = deck.splice(0, 1)[0];
      card.up = false;
      state[`pile${j}`].push(card);
    }
  }
  // Finally, get the draw right
  state.draw = deck.map((card) => {
    card.up = false;
    return card;
  });
  return state;
};

const filterGameForProfile = (game) => ({
  active: game.active,
  score: game.score,
  won: game.won,
  id: game._id,
  game: "klondyke",
  start: game.start,
  state: game.state,
  moves: game.moves,
  winner: game.winner,
});

const filterMoveForResults = (move) => ({
  ...move,
});

const validatePileToPile = (state, srcPileName, dstPileName, srcCard) => {
  let srcPile = state[srcPileName];
  let dstPile = state[dstPileName];
  // Case 0: Empty srcPile
  if (srcPile.length === 0) {
      return false;
  }

  // Case 1: Empty dstPile
  if (dstPile.length === 0) {
      return srcCard.value === "king";
  }
  let dstCard = dstPile[dstPile.length - 1];

  // Case 2: Illegal Moves
  // 2.1: Same Pile
  let isSamePile = srcPileName === dstPileName;
  // 2.2: Same Color
  let isSrcCardRedColor = (srcCard.suit === "diamonds" || srcCard.suit === "hearts");
  let isDstCardRedColor = (dstCard.suit === "diamonds" || dstCard.suit === "hearts");
  let isSameColor = (isSrcCardRedColor && isDstCardRedColor) || (!isSrcCardRedColor && !isDstCardRedColor);
  // 2.3: Cards Not Up
  let isCardNotUp = !srcCard.up || !dstCard.up;
  if (isSamePile || isSameColor || isCardNotUp) {
      return false;
  }

  // Case 3: Legal Moves (srcCard = dstCard - 1)
  // 3.1: Ace, Jack, Queen, King Involved
  let queenToJack = srcCard.value === "queen" && dstCard.value === "king";
  let jackToQueen = srcCard.value === "jack" && dstCard.value === "queen";
  let tenToJack = srcCard.value === "10" && dstCard.value === "jack";
  let aceToTwo = srcCard.value === "ace" && dstCard.value === "2";
  // 3.2: Normal Numbers
  // Case 4: Other Illegal Moves
  return queenToJack || jackToQueen || tenToJack || aceToTwo || dstCard.value - srcCard.value === 1;
}

const validatePileToStack = (state, srcPileName, dstStackName) => {
  let srcPile = state[srcPileName];
  let dstStack = state[dstStackName];
  // Case 0: Empty srcPile
  if (srcPile.length === 0) {
      return false;
  }
  let srcCard = srcPile[srcPile.length - 1];

  // Case 1: Empty dstStack
  if (dstStack.length === 0) {
      return srcCard.value === "ace";
  }
  let dstCard = dstStack[dstStack.length - 1];

  // Case 2: Occupied Stack
  if (srcCard.suit !== dstCard.suit) {
      return false;
  }

  // Case 3: Legal Moves (srcCard = dstCard + 1)
  // 3.1: Ace, Jack, Queen, King Involved
  let kingToQueen = srcCard.value === "king" && dstCard.value === "queen";
  let queenToJack = srcCard.value === "queen" && dstCard.value === "jack";
  let jackToTen = srcCard.value === "jack" && dstCard.value === "10";
  let twoToAce = srcCard.value === "2" && dstCard.value === "ace";
  // 3.2: Normal Numbers
  // Case 4: Other Illegal Moves
  return kingToQueen || queenToJack || jackToTen || twoToAce || srcCard.value - dstCard.value === 1;
}

const validateStackToPile = (state, srcStackName, dstPileName) => {
  let srcStack = state[srcStackName];
  let dstPile = state[dstPileName];
  // Case 0: Empty srcStack
  if (srcStack.length === 0) {
      return false;
  }
  let srcCard = srcStack[srcStack.length - 1];

  // Case 1: Empty dstPile
  if (dstPile.length === 0) {
      return srcCard.value === "king";
  }
  let dstCard = dstPile[dstPile.length - 1];

  // Case 2: Illegal Moves (Same Color)
  let isSrcCardRedColor = (srcCard.suit === "diamonds" || srcCard.suit === "hearts");
  let isDstCardRedColor = (dstCard.suit === "diamonds" || dstCard.suit === "hearts");
  if ((isSrcCardRedColor && isDstCardRedColor) || (!isSrcCardRedColor && !isDstCardRedColor)) {
      return false;
  }

  // Case 3: Legal Moves (srcCard = dstCard - 1)
  // 3.1: Ace, Jack, Queen, King Involved
  let queenToJack = srcCard.value === "queen" && dstCard.value === "king";
  let jackToQueen = srcCard.value === "jack" && dstCard.value === "queen";
  let tenToJack = srcCard.value === "10" && dstCard.value === "jack";
  let aceToTwo = srcCard.value === "ace" && dstCard.value === "2";
  // 3.2: Normal Numbers
  // Case 4: Other Illegal Moves
  return queenToJack || jackToQueen || tenToJack || aceToTwo || dstCard.value - srcCard.value === 1;
}

const validateMoveHelper = (currentState, requestedMove) => {
  let cards = requestedMove.cards;
  let src = requestedMove.src;
  let dst = requestedMove.dst;
  let srcIsPile = src.indexOf("pile") !== -1;
  let srcIsStack = src.indexOf("stack") !== -1;
  let srcIsDraw = src === "draw";
  let srcIsDiscard = src === "discard";
  let dstIsPile = dst.indexOf("pile") !== -1;
  let dstIsStack = dst.indexOf("stack") !== -1;
  let dstIsDraw = dst === "draw";
  let dstIsDiscard = dst === "discard";

  // Pile to Pile
  if (srcIsPile && dstIsPile) {
      return validatePileToPile(currentState, src, dst, cards[0]);
  }
  // Pile to Stack
  if (srcIsPile && dstIsStack) {
      return validatePileToStack(currentState, src, dst);
  }
  // Stack to Pile
  if (srcIsStack && dstIsPile) {
      return validateStackToPile(currentState, src, dst);
  }
  // Discard to Pile
  if (srcIsDiscard && dstIsPile) {
      return validatePileToPile(currentState, src, dst, cards[0]);
  }
  // Discard to Stack
  if (srcIsDiscard && dstIsStack) {
      return validatePileToStack(currentState, src, dst);
  }
  // Draw to Discard / Discard All Back to Draw
  return (srcIsDraw && dstIsDiscard) || (srcIsDiscard && dstIsDraw);
};

const validateMove = (state, move) => {
  if (!validateMoveHelper(state, move)) {
    console.log("State is null!!!")
      return null;
  } 
  console.log("Sate not null")
  let src = move.src;
  let dst = move.dst;
  let cards = move.cards;
  // Update state

  state[src] = state[src].slice(0, -cards.length);
  state[dst] = state[dst].concat(cards);
  
  // Change the bottom card to face upwards if needed
  if (src !== "draw" && state[src].length > 0) {
      state[src][state[src].length - 1].up = true;
  }
  // Make sure all cards in the draw pile is facing downwards
  if (dst === "draw") {
      for (let i = 0; i < state.draw.length; ++i) {
          state.draw[i].up = false;
      }
  }
  // Change the top card in discard pile to face upwards
  if (state.discard.length > 0) {
      state.discard[state.discard.length - 1].up = true;
  }
  return {
      pile1: state.pile1,
      pile2: state.pile2,
      pile3: state.pile3,
      pile4: state.pile4,
      pile5: state.pile5,
      pile6: state.pile6,
      pile7: state.pile7,
      stack1: state.stack1,
      stack2: state.stack2,
      stack3: state.stack3,
      stack4: state.stack4,
      draw: state.draw,
      discard: state.discard,
  };
}

module.exports = {
  shuffleCards: shuffleCards,
  initialState: initialState,
  filterGameForProfile: filterGameForProfile,
  filterMoveForResults: filterMoveForResults,
  validateMove: validateMove
};