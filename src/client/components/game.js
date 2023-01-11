/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Pile, Card } from "./pile.js";


const GameBase = styled.div`
  position: absolute;
  top: 65px;
  bottom: 0;
  width: 100%;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;


export const Game = () => {
  const { id } = useParams();
  let [state, setState] = useState({
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
    src: "",
    dst: "",
    backgroundCheck: false,
    cardDeck: [],
    cardIndex: 0,
    endGame: false,
    active: null
  });
  const [firstClickCheck, setFirstClickCheck] = useState(true);

  // let [target, setTarget] = useState(undefined);
  // let [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${id}`);

      const data = await response.json();
      // console.log(data.won);

      let end = checkEndGame(data.state);
      console.log(`Initially, endgame is ${end}`)
      setState({
        pile1: data.pile1,
        pile2: data.pile2,
        pile3: data.pile3,
        pile4: data.pile4,
        pile5: data.pile5,
        pile6: data.pile6,
        pile7: data.pile7,
        stack1: data.stack1,
        stack2: data.stack2,
        stack3: data.stack3,
        stack4: data.stack4,
        draw: data.draw,
        discard: data.discard,
        endGame: end,
        active: data.active
      }
      );
    };
    getGameState();
  }, [id]);

  const validatePileToStack = (state, srcCards, dstStackName) => {
    if (srcCards.length === 0) {
      return false;
    }
    let dstStack = state[dstStackName];
    let srcCard = srcCards[0];

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

  const checkEndGame = (state) => {
    // Check 7 piles & discard pile
    for (let i = 1; i <= 8; ++i) {
      let srcPile = i < 8 ? state[`pile${i}`] : state.discard;
      let srcCards = srcPile.slice(-1);
      for (let j = 1; j <= 4; ++j) {
        if (validatePileToStack(state, srcCards, `stack${j}`)) {
          console.log("EndGame: false");
          return false;
        }
      }
    }

    for (let i = 1; i <= 8; ++i) {
      let srcPile = i < 8 ? state[`pile${i}`] : state.discard;
      let sourcePile = i < 8 ? `pile${i}` : "discard";
      let srcCards = srcPile.slice(-1);
      for (let j = 1; j <= 8; ++j) {
        let dstPile = j < 8 ? `pile${j}` : "discard";
        console.log(`srcPileName : ${srcPile}`);
        console.log(`dstPileName : ${dstPile}`);
        console.log(srcCards[0]);
        if (validatePileToPile(state, sourcePile, dstPile, srcCards[0])) {
          console.log("EndGame: false");
          return false;
        }
      }
    }
    console.log("EndGame: true");
    return true;
  }

  const checkWin = () => {
    return state.stack1.length === 13 && state.stack2.length === 13
      && state.stack3.length === 13 && state.stack4.length === 13;
  }

  const endGame = async () => {
    // event.preventDefault();
    console.log("End Game Button")
    if (checkWin()) {
      alert("YOU WIN!");
    } else {
      alert("Currently, no valid move from pile to stack, discard to stack, or pile to pile is available. You can choose to restart or proceed the game by clicking the draw deck.");
    }
  }

  const autoComplete = async () => {
    let movedLastRound = true;
    while (movedLastRound) {
      movedLastRound = false;
      for (let i = 1; i <= 8; ++i) {
        let srcPile = i < 8 ? state[`pile${i}`] : state.discard;
        let srcCards = srcPile.slice(-1);
        for (let j = 1; j <= 4; ++j) {
          if (validatePileToStack(state, srcCards, `stack${j}`)) {
            let moved = await sendMove({
              cards: srcCards,
              src: i < 8 ? `pile${i}` : "discard",
              dst: `stack${j}`
            });
            if (moved) {
              movedLastRound = true;
              break;
            }
          }
        }
      }
    }
  }

  const sendMove = async (move) => {
    let response = await fetch(`/v1/game/${id}`, {
      method: "PUT",
      body: JSON.stringify(move),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 202) {
      console.log("Success move!!");
      let data = await response.json();
      let end = checkEndGame(data);
      console.log(`after move, endgame is ${end}`)
      setState({
        pile1: data.pile1,
        pile2: data.pile2,
        pile3: data.pile3,
        pile4: data.pile4,
        pile5: data.pile5,
        pile6: data.pile6,
        pile7: data.pile7,
        stack1: data.stack1,
        stack2: data.stack2,
        stack3: data.stack3,
        stack4: data.stack4,
        draw: data.draw,
        discard: data.discard,
        endGame: end
      });
      return true;
    }
    return false;
  }


  const getAutoCompleteButton = () => {
    return state.active ?
      <button id="btn" className="btn btn-danger"  onClick={autoComplete}>
        Auto-Complete
        </button> : undefined;
  }


  const onClick = (ev) => {
    let target = ev.target;
    let isInDraw = false;

    const checkCardSrc = () => {
      let drawDeck = () => {
        if (target.id === "draw" && state.draw.length === 0 && state.discard.length !== 0) {
          isInDraw = true;
          state.src = "discard";
          state.dst = "draw";
          state.cardIndex = 0;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.discard.length; i++) {
            state.cardDeck = state.discard.slice();
          }
        }
        state.draw.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            isInDraw = true;
            state.src = "draw";
            state.dst = "discard";
            state.cardIndex = key;
            state.backgroundCheck = true;
            for (let i = state.cardIndex; i < state.draw.length; i++) {
              state.cardDeck = state.draw.slice(state.cardIndex);
            }
          }
        });
      }
      drawDeck();

      state.stack1.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "stack1";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.stack1.length; i++) {
            state.cardDeck = state.stack1.slice(state.cardIndex);
          }
        }
      });
      state.stack2.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "stack2";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.stack2.length; i++) {
            state.cardDeck = state.stack2.slice(state.cardIndex);
          }
        }
      });
      state.stack3.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "stack3";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.stack3.length; i++) {
            state.cardDeck = state.stack3.slice(state.cardIndex);
          }
        }
      });
      state.stack4.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "stack4";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.stack4.length; i++) {
            state.cardDeck = state.stack4.slice(state.cardIndex);
          }
        }
      });

      state.pile1.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "pile1";
          state.cardIndex = key;
          state.backgroundCheck = true;

          for (let i = state.cardIndex; i < state.pile1.length; i++) {
            state.cardDeck = state.pile1.slice(state.cardIndex);
          }
        }
      });


      state.pile2.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "pile2";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.pile2.length; i++) {
            state.cardDeck = state.pile2.slice(state.cardIndex);
          }
        }

      });

      state.pile3.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "pile3";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.pile3.length; i++) {
            state.cardDeck = state.pile3.slice(state.cardIndex);
          }
        }
      });

      state.pile4.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "pile4";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.pile4.length; i++) {
            state.cardDeck = state.pile4.slice(state.cardIndex);
          }
        }
      });

      state.pile5.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "pile5";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.pile5.length; i++) {
            state.cardDeck = state.pile5.slice(state.cardIndex);
          }
        }
      });
      state.pile6.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "pile6";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.pile6.length; i++) {
            state.cardDeck = state.pile6.slice(state.cardIndex);
          }
        }
      });
      state.pile7.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "pile7";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.pile7.length; i++) {
            state.cardDeck = state.pile7.slice(state.cardIndex);
          }
        }
      });

      state.discard.map(function (element, key) {
        if (`${element.suit}:${element.value}` === target.id) {
          state.src = "discard";
          state.cardIndex = key;
          state.backgroundCheck = true;
          for (let i = state.cardIndex; i < state.discard.length; i++) {
            state.cardDeck = state.discard.slice(state.cardIndex);
          }
        }
      });

    }

    const checkCardDst = () => {
      let drawDeck = () => {
        if (target.id === "draw" && state.draw.length === 0 && state.discard.length !== 0) {
          isInDraw = true;
          state.src = "discard";
          state.dst = "draw";
          state.cardIndex = 0;
          for (let i = state.cardIndex; i < state.discard.length; i++) {
            state.cardDeck = state.discard.slice(state.cardIndex);
          }
        }
        state.draw.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            isInDraw = true;
            state.src = "draw";
            state.dst = "discard";
            state.cardIndex = key;
            state.backgroundCheck = true;
            for (let i = state.cardIndex; i < state.draw.length; i++) {
              state.cardDeck = state.draw.slice(state.cardIndex);
            }
          }
        });
      }
      drawDeck();

      let stackDeck1 = () => {
        if (target.id === "stack1") {
          state.cardIndex = 0;
          state.dst = "stack1";
          state.backgroundCheck = true;
        }
        state.stack1.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "stack1";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      stackDeck1();
      let stackDeck2 = () => {
        if (target.id === "stack2") {
          state.cardIndex = 0;
          state.dst = "stack2";
          state.backgroundCheck = true;
        }
        state.stack2.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "stack2";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      stackDeck2();

      let stackDeck3 = () => {
        if (target.id === "stack3") {
          state.cardIndex = 0;
          state.dst = "stack3";
          state.backgroundCheck = true;
        }
        state.stack3.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "stack3";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      stackDeck3();


      let stackDeck4 = () => {
        if (target.id === "stack4") {
          state.cardIndex = 0;
          state.dst = "stack4";
          state.backgroundCheck = true;
        }
        state.stack4.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "stack4";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      stackDeck4();

      let piile1 = () => {
        if (target.id === "pile1") {
          state.cardIndex = 0;
          state.dst = "pile1";
          state.backgroundCheck = true;
        }
        state.pile1.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "pile1";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      piile1();

      let piile2 = () => {
        if (target.id === "pile2") {
          state.cardIndex = 0;
          state.dst = "pile2";
          state.backgroundCheck = true;
        }
        state.pile2.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "pile2";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      piile2();

      let piile3 = () => {
        if (target.id === "pile3") {
          state.cardIndex = 0;
          state.dst = "pile3";
          state.backgroundCheck = true;
        }
        state.pile3.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "pile3";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      piile3();

      let piile4 = () => {
        if (target.id === "pile4") {
          state.cardIndex = 0;
          state.dst = "pile4";
          state.backgroundCheck = true;
        }
        state.pile4.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "pile4";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      piile4();

      let piile5 = () => {
        if (target.id === "pile5") {
          state.cardIndex = 0;
          state.dst = "pile5";
          state.backgroundCheck = true;
        }
        state.pile5.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "pile5";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      piile5();

      let piile6 = () => {
        if (target.id === "pile6") {
          state.cardIndex = 0;
          state.dst = "pile6";
          state.backgroundCheck = true;
        }
        state.pile6.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "pile6";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      piile6();

      let piile7 = () => {
        if (target.id === "pile7") {
          state.cardIndex = 0;
          state.dst = "pile7";
          state.backgroundCheck = true;
        }
        state.pile7.map(function (element, key) {
          if (`${element.suit}:${element.value}` === target.id) {
            state.dst = "pile7";
            state.cardIndex = key;
            state.backgroundCheck = true;
          }
        });
      }
      piile7();

      state.discard.forEach((element) => {//check if target is in the Draw Pile
        if (`${element.suit}:${element.value}` === target.id) {
          state.dst = "discard";
          state.backgroundCheck = true;
        }
      })

    }

    if (firstClickCheck) {
      state.backgroundCheck = false;
      state.src = "";
      state.dst = "";
      checkCardSrc();
      setFirstClickCheck(false);
      if (!state.backgroundCheck) {
        state.src = "";
        state.dst = "";
        setFirstClickCheck(true);

      }

      if (target.src === "http://localhost:8080/images/face_down.jpg" && !isInDraw) {
        setFirstClickCheck(true);
        state.src = "";
        state.dst = "";
      }

      if (state.src !== "" && state.dst !== "") {
        setFirstClickCheck(true);
        let move = { cards: state.cardDeck, src: state.src, dst: state.dst };
        console.log(move);
        const sendMove = async (move) => {
          let response = await fetch(`/v1/game/${id}`, {
            method: "PUT",
            body: JSON.stringify(move),
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.status === 202) {
            console.log("Success move!!");
            let data = await response.json();
            let end = checkEndGame(data)
            console.log(`after move, endgame is ${end}`)
            setState({
              pile1: data.pile1,
              pile2: data.pile2,
              pile3: data.pile3,
              pile4: data.pile4,
              pile5: data.pile5,
              pile6: data.pile6,
              pile7: data.pile7,
              stack1: data.stack1,
              stack2: data.stack2,
              stack3: data.stack3,
              stack4: data.stack4,
              draw: data.draw,
              discard: data.discard,
              endGame: end
            });
          }
        }
        sendMove(move)
      }
    } else {
      state.backgroundCheck = false;
      checkCardDst();
      setFirstClickCheck(true);
      if (!state.backgroundCheck) {
        state.src = "";
        state.dst = "";

      }
      if (state.src !== "" && state.dst !== "") {
        let move = { cards: state.cardDeck, src: state.src, dst: state.dst };
        console.log(move);
        const sendMove = async (move) => {
          let response = await fetch(`/v1/game/${id}`, {
            method: "PUT",
            body: JSON.stringify(move),
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (response.status === 202) {
            console.log("Success move!!!");
            let data = await response.json();
            let end = checkEndGame(data);
            console.log(`after move, endgame is ${end}`)
            setState({
              pile1: data.pile1,
              pile2: data.pile2,
              pile3: data.pile3,
              pile4: data.pile4,
              pile5: data.pile5,
              pile6: data.pile6,
              pile7: data.pile7,
              stack1: data.stack1,
              stack2: data.stack2,
              stack3: data.stack3,
              stack4: data.stack4,
              draw: data.draw,
              discard: data.discard,
              endGame: end
            });
          }
        }
        sendMove(move)
      }
    }

  }


  return (
    <GameBase onClick={onClick}>
      <div className="col-sm-2" >
      <button id="btn" className="btn btn-danger"  onClick={autoComplete}>
        Auto-Complete
        </button>
        <p>   </p>
        <button id="btn" className="btn btn-danger" disabled={!state.endGame} onClick={endGame}>
         End Game Detected
     </button> 
        {/* {getAutoCompleteButton()} */}
        {/* {getEndButton()} */}
      </div>
      <CardRow>
        <Pile id="stack1" cards={state.stack1} spacing={0} />
        <Pile id="stack2" cards={state.stack2} spacing={0} />
        <Pile id="stack3" cards={state.stack3} spacing={0} />
        <Pile id="stack4" cards={state.stack4} spacing={0} />
        <CardRowGap />
        <Pile id="draw" cards={state.draw} spacing={0} />
        <Pile id="discard" cards={state.discard} spacing={0} />
      </CardRow>
      <CardRow>
        <Pile id="pile1" cards={state.pile1} />
        <Pile id="pile2" cards={state.pile2} />
        <Pile id="pile3" cards={state.pile3} />
        <Pile id="pile4" cards={state.pile4} />
        <Pile id="pile5" cards={state.pile5} />
        <Pile id="pile6" cards={state.pile6} />
        <Pile id="pile7" cards={state.pile7} />
      </CardRow>
      <div id="errorMsg"></div>
      {/* { checkWin() && state.active ? (
        <ModalNotify
          id="notification"
          msg="Congratulations! You Win!!"
          onAccept={endGame()}
        />
      ) : null} */}
    </GameBase>


  );
};

Game.propTypes = {};