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
        const w = p5.width  - p5.floor(p5.width%SQUARE_SIZE);
        const h = p5.height - p5.floor(p5.height%SQUARE_SIZE);
        const x = (p5.width  - w) / 2;
        const y = (p5.height - h) / 2;
        p5.rect(x, y, w, h);
        p5.push();
        p5.translate(x, y);
        state.snake.map(p => colorSquare(p5, p[0], p[1], SNAKE_COLOR))
        colorSquare(p5, state.apple[0], state.apple[1], APPLE_COLOR)
        p5.pop();
    }

    let state, nextState;
    let prevTouchIds = []; // Prevents one touch from spamming move enqueues

    return(
        <Sketch
            setup={(p5, canvasParentRef) => {
                p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
                p5.frameRate(p5.width > p5.height ? 20 : 12);
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

                if (p5.touches) {
                    for (let touch of p5.touches) {
                        if (touch.id in prevTouchIds)
                            continue;
                        const swipeAngle = p5.atan2(touch.x - p5.height/2, touch.y - p5.width/2);
                        let move = null;
                        p5.noStroke();
                        p5.fill(255, 20);
                        if (swipeAngle >= -p5.QUARTER_PI && swipeAngle < p5.QUARTER_PI) {
                            move = SnakeGame.EAST;
                            p5.triangle(p5.width, 0, p5.width, p5.height, p5.width/2, p5.height/2);
                        }
                        else if (swipeAngle >= p5.QUARTER_PI && swipeAngle < 3*p5.QUARTER_PI) {
                            move = SnakeGame.SOUTH;
                            p5.triangle(p5.width, p5.height, 0, p5.height, p5.width/2, p5.height/2);
                        }
                        else if (swipeAngle >= 3*p5.QUARTER_PI || swipeAngle < -3*p5.QUARTER_PI) {
                            move = SnakeGame.WEST;
                            p5.triangle(0, p5.height, 0, 0, p5.width/2, p5.height/2);
                        }
                        else {
                            move = SnakeGame.NORTH;
                            p5.triangle(0, 0, p5.width, 0, p5.width/2, p5.height/2);
                        }
                        if (move)
                            state = SnakeGame.enqueueMove(state, move)
                        prevTouchIds.push(touch.id);
                    }
                    prevTouchIds = p5.touches.map(x => x.id);
                }
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

            touchStarted={p5 => {
                // const touchX = p5.mouseX;
                // const touchY = p5.mouseY;
                // const swipeAngle = p5.atan2(touchY - p5.height/2, touchX - p5.width/2);
                // let move = null;
                // p5.noStroke();
                // p5.fill(255, 20);
                // if (swipeAngle >= -p5.QUARTER_PI && swipeAngle < p5.QUARTER_PI) {
                //     move = SnakeGame.EAST;
                //     p5.triangle(p5.width, 0, p5.width, p5.height, p5.width/2, p5.height/2);
                // }
                // else if (swipeAngle >= p5.QUARTER_PI && swipeAngle < 3*p5.QUARTER_PI) {
                //     move = SnakeGame.SOUTH;
                //     p5.triangle(p5.width, p5.height, 0, p5.height, p5.width/2, p5.height/2);
                // }
                // else if (swipeAngle >= 3*p5.QUARTER_PI || swipeAngle < -3*p5.QUARTER_PI) {
                //     move = SnakeGame.WEST;
                //     p5.triangle(0, p5.height, 0, 0, p5.width/2, p5.height/2);
                // }
                // else {
                //     move = SnakeGame.NORTH;
                //     p5.triangle(0, 0, p5.width, 0, p5.width/2, p5.height/2);
                // }
                // if (move)
                //     state = SnakeGame.enqueueMove(state, move)
            }}
        />
    );
}