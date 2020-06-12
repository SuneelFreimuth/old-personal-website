import React from 'react';
import styles from './Snake.module.css';
import Sketch from 'react-p5';
import * as SnakeGame from './SnakeModel'
import { divide } from 'ramda';


export default function Snake() {
    const SQUARE_SIZE = 20;
    const SNAKE_COLOR = '#00FF00';
    const APPLE_COLOR = '#FF0000';

    const colorSquare = (p5, x, y, color) => {
        p5.fill(color);
        p5.rect(SQUARE_SIZE*x, SQUARE_SIZE*y, SQUARE_SIZE, SQUARE_SIZE);
    }

    const displayGame = (p5, state) => {
        p5.fill(25);
        const w = p5.width  - p5.floor(p5.width/SQUARE_SIZE);
        const h = p5.height - p5.floor(p5.height/SQUARE_SIZE);
        const x = (p5.width  - w) / 2;
        const y = (p5.height - h) / 2;
        p5.rect(x, y, w, h)
        state.snake.map(p => colorSquare(p5, p[0], p[1], SNAKE_COLOR))
        colorSquare(p5, state.apple[0], state.apple[1], APPLE_COLOR)
    }

    let state, nextState;

    return(
        <Sketch
            setup={(p5, canvasParentRef) => {
                p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
                p5.frameRate(20);
                p5.noStroke();
                SnakeGame.initialState.cols = Math.floor(p5.width / SQUARE_SIZE);
                SnakeGame.initialState.rows = Math.floor(p5.height / SQUARE_SIZE);
                state = SnakeGame.initialState;
                nextState = SnakeGame.nextState(SnakeGame.initialState);
                console.log(nextState);
            }}

            draw={p5 => {
                p5.background(40);
                displayGame(p5, state);
                state = nextState(state);
            }}

            keyPressed={p5 => {
                let move = null;
                const [ W,A,S,D,H,J,K,L ] = 'WASDHJKL'.split('').map(s => s.charCodeAt(0))
                switch(p5.keyCode) {
                    case p5.UP_ARROW:
                    case W:
                    case K:
                        move = SnakeGame.NORTH;
                        break;
                    case p5.DOWN_ARROW:
                    case S:
                    case J:
                        move = SnakeGame.SOUTH;
                        break;
                    case p5.LEFT_ARROW:
                    case A:
                    case H:
                        move = SnakeGame.WEST;
                        break;
                    case p5.RIGHT_ARROW:
                    case D:
                    case L:
                        move = SnakeGame.EAST;
                        break;
                }
                if (move)
                    state = SnakeGame.enqueueMove(state, move)
            }}
        />
    );
}