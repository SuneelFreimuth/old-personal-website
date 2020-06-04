import React from 'react';
import Sketch from 'react-p5';
import { constrain } from '../../utils';

import styles from './Dots.module.css';

export default function Sun() {
  const NUM_DOTS = 9;
  const TARGET_MARGIN = 30;
  const TOUCH_TOLERANCE = 30;
  let dots;

  function easeOut(t) {
    return 1 - (t-1)**2;
  }

  function newTarget(p5) {
    return [ p5.random(TARGET_MARGIN, p5.width - TARGET_MARGIN),
      p5.random(TARGET_MARGIN, p5.height - TARGET_MARGIN) ];
  }

  return (
    <Sketch
      setup={(p5, canvasParentRef) => {
        p5.createCanvas(p5.windowWidth,p5.windowHeight).parent(canvasParentRef);
        p5.colorMode(p5.HSB);
        
        dots = [];
        for (let i = 0; i < NUM_DOTS; i++) {
          let [targX, targY] = newTarget(p5);
          dots.push({
            x: p5.random(p5.width),
            y: p5.random(p5.height),
            targX, targY,
            r: p5.random(p5.width/15, p5.width/6)/2,
            c: p5.color(p5.random(360), p5.random(75, 100), p5.random(75, 100))
          });
        }
      }}

      draw={p5 => {
        p5.background(255);
        p5.noStroke();
        for (let dot of dots) {
          dot.x += (dot.targX - dot.x)/5;
          dot.y += (dot.targY - dot.y)/5;
          p5.fill(dot.c);
          p5.ellipse(dot.x, dot.y, 2*dot.r);
          // p5.noFill();
          // p5.stroke(0, 100, 100);
          // p5.ellipse(dot.x, dot.y, TOUCH_TOLERANCE*2);
        }
      }}

      windowResized={p5 => {
        p5.resizeCanvas(p5.windowWidth,p5.windowHeight);
      }}

      mouseClicked={p5 => {
        for (let dot of dots) {
          if (p5.dist(dot.x, dot.y, p5.mouseX, p5.mouseY) < dot.r) {
            [ dot.targX, dot.targY ] = newTarget(p5);
          }
        }
      }}

      touchEnded={p5 => {
        for (let dot of dots) {
          if (p5.dist(dot.x, dot.y, p5.mouseX, p5.mouseY) < p5.constrain(dot.r, TOUCH_TOLERANCE, dot.r)) {
            [ dot.targX, dot.targY ] = newTarget(p5);
          }
        }
      }}

      className={styles.canvas}
    />
  );
}