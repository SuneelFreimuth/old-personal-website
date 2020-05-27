import React from 'react';
import Sketch from 'react-p5';
import { constrain } from '../../utils';

import styles from './Sun.module.css';

export default function Sun() {
  function angledRect(p5, x, y, w, h, angle) {
    p5.push();
    p5.translate(x, y);
    p5.rotate(angle);
    p5.rect(-w/2, -h/2, w, h);
    p5.pop();
  }

  let minLength, maxLength;
  let rays;
  let numRays;
  let sunRadius;
  let textSize;

  return (
    <Sketch
      setup={(p5, canvasParentRef) => {
        p5.createCanvas(p5.windowWidth,p5.windowHeight).parent(canvasParentRef);
        p5.colorMode(p5.HSB);

        textSize = 50;
        p5.textAlign(p5.CENTER);
        p5.textSize(textSize);
        p5.textFont('Montserrat');

        numRays = 300;
        sunRadius = 175;
      }}

      draw={p5 => {
        p5.background(0);
        p5.strokeWeight(1.1);
        p5.noFill();

        for (let i = 0; i < numRays; i++) {
          let rayLength = 600*p5.noise(100*i) + 25*p5.sin(p5.frameCount*0.01+i*p5.TWO_PI/numRays*17);
          p5.stroke(255, p5.map(constrain(rayLength, sunRadius, 450), sunRadius, 450, 1, 0));
          p5.line(p5.width/2, p5.height/2,
            p5.width/2  + rayLength*p5.cos(20*p5.noise(i)),
            p5.height/2 + rayLength*p5.sin(20*p5.noise(i)));
        }

        p5.fill(0);
        p5.noStroke();
        p5.ellipse(p5.width/2, p5.height/2, 2*sunRadius, 2*sunRadius);
        p5.fill(255);
        // p5.text('COMING', p5.width/2, p5.height/2-textSize/2-10);
        // p5.text('SOON', p5.width/2, p5.height/2+textSize/2+10);
        p5.text('COMING\nSOON', p5.width/2, p5.height/2-10);
      }}

      windowResized={p5 => {
        p5.resizeCanvas(p5.windowWidth,p5.windowHeight);
      }}

      className={styles.canvas}
    />
  );
}