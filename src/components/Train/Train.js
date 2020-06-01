import React from 'react';
import Sketch from 'react-p5';
import styles from './Train.module.css';
import Matter from 'matter-js';
import decomp from 'poly-decomp';

window.decomp = decomp;

let Engine = Matter.Engine,
World = Matter.World,
Bodies = Matter.Bodies,
Body = Matter.Body,
Constraint = Matter.Constraint;

let p5;

export default function Train() {

    let engine;

    function category(categories, invert=false) {
        let n = 0;
        if (Array.isArray(categories)) {
            for (let c of categories) {
                n = n | (1 << c);
            }
        } else if (typeof categories == 'number') {
            n = n | (1 << categories);
        }
        return invert ? ~n : n;
    }

    function pinConstraint(shapeA, shapeB, pointA, stiffness=0.8) {
        let constraint = Constraint.create({
            bodyA: shapeA.body,
            bodyB: shapeB.body,
            pointA: pointA,
            pointB: {
                x: (shapeA.body.position.x + pointA.x) - shapeB.body.position.x,
                y: (shapeA.body.position.y + pointA.y) - shapeB.body.position.y
            },
            stiffness: stiffness,
            // length: 0
        });
        World.add(engine.world, constraint);
        return constraint;
    }

    function drawCenteredImage(p5, img, x, y, w=img.width, h=img.height) {
        p5.image(img, x - w/2, y - h/2, w, h);
    }

    function symrand(lim) {
        return lim*(2*Math.random()-1);
    }


    class Box {
        constructor(x, y, w, h, options) {
            this.body = Bodies.rectangle(x+w/2, y+h/2, w, h, options);
            this.width = w;
            this.height = h;
            World.add(engine.world, this.body);
        }

        display(p5) {
            p5.beginShape();
            for (let vert of this.body.vertices) {
                p5.vertex(vert.x, vert.y);
            }
            p5.endShape(p5.CLOSE);
        }
    }


    class Circle {
        constructor(x, y, r, options) {
            this.body = Bodies.circle(x, y, r, options);
            this.radius = r;
            World.add(engine.world, this.body);
        }

        display(p5) {
            p5.ellipse(this.body.position.x, this.body.position.y, 2*this.radius);
            // line(this.body.position.x, this.body.position.y,
            // 	this.body.position.x + this.radius * cos(this.body.angle),
            // 	this.body.position.y + this.radius * sin(this.body.angle));
        }

        applyTorque(torque) {
            this.body.torque = torque;
        }

        setAngularVelocity(angularVelocity) {
            Body.setAngularVelocity(this.body, angularVelocity);
        }
    }


    class Polygon {
        constructor(x, y, vertices) {
            this.body = Bodies.fromVertices(x, y, vertices);
            World.add(engine.world, this.body);
        }

        display(p5) {
            p5.beginShape();
            for (let vert of this.body.vertices) {
                p5.vertex(vert.x, vert.y);
            }
            p5.endShape();
        }
    }

    class Train {
        constructor(x, y) {
            this.x = x;
            this.y = y;

            // Make box
            this.boxLeftWall = new Box(x, y-Train.boxHeight, Train.boxThickness, Train.boxHeight);
            this.boxRightWall = new Box(x + Train.boxWidth-Train.boxThickness, y-Train.boxHeight, Train.boxThickness, Train.boxHeight);
            this.boxTopWall = new Box(x, y-Train.boxHeight, Train.boxWidth, Train.boxThickness);

            // Make base
            this.base = new Box(x, y, Train.baseWidth, Train.baseHeight);

            // Make wedge
            let wedgePoints = [
                {x: 0, y: -Train.baseHeight},
                {x: 0, y: 0},
                {x: Train.wedgeLength, y: 0},
            ];
            this.wedge = new Polygon(x + Train.baseWidth + Train.wedgeLength/3,
                y + Train.baseHeight - Train.baseHeight/3, wedgePoints);

            // Make wheels
            this.backWheel = new Circle(x + Train.baseWidth*1/6, y + Train.baseHeight - Train.backWheelRadius + Train.wheelLift,
                Train.backWheelRadius, { friction: 0.9 });
            this.midWheel = new Circle(x + Train.baseWidth*3/6, y + Train.baseHeight - Train.midWheelRadius + Train.wheelLift,
                Train.midWheelRadius, { friction: 0.9 });
            this.frontWheel = new Circle(x + Train.baseWidth*5/6, y + Train.baseHeight - Train.frontWheelRadius + Train.wheelLift,
                Train.frontWheelRadius, { friction: 0.9 });

            // Make stack with mouth
            this.stack = new Box(x + Train.baseWidth - Train.stackWidth, y - Train.stackHeight,
                Train.stackWidth, Train.stackHeight);
            this.stackMouth = new Polygon(x + Train.baseWidth - Train.stackWidth/2,
                y - Train.stackHeight - Train.stackMouthHeight/2, [
                    { x: 0, y: 0 },
                    { x: -(Train.stackMouthWidth - Train.stackWidth)/2, y: -Train.stackMouthHeight },
                    { x: Train.stackWidth + (Train.stackMouthWidth - Train.stackWidth)/2, y: -Train.stackMouthHeight },
                    { x: Train.stackWidth, y: 0 },
                ]
            );

            // Bind left and right box walls to top wall
            this.boxLeftWall.body.collisionFilter.group = -1;
            this.boxRightWall.body.collisionFilter.group = -1;
            this.boxTopWall.body.collisionFilter.group = -1;
            let boxStiffness = 0.95;
            pinConstraint(this.boxLeftWall, this.boxTopWall, {
                x: -this.boxLeftWall.width/2,
                y: -this.boxLeftWall.height/2 + this.boxTopWall.height
            }, boxStiffness);
            pinConstraint(this.boxLeftWall, this.boxTopWall, {
                x: this.boxLeftWall.width/2,
                y: -this.boxLeftWall.height/2
            }, boxStiffness);
            pinConstraint(this.boxRightWall, this.boxTopWall, {
                x: this.boxRightWall.width/2,
                y: -this.boxRightWall.height/2
            }, boxStiffness);
            pinConstraint(this.boxRightWall, this.boxTopWall, {
                x: -this.boxRightWall.width/2,
                y: -this.boxRightWall.height/2 + this.boxTopWall.height
            }, boxStiffness);
            
            // Bind box to base (left and right walls)
            this.base.body.collisionFilter.group = -1;
            pinConstraint(this.boxLeftWall, this.base, {
                x: -this.boxLeftWall.width/2,
                y: this.boxLeftWall.height/2
            }, boxStiffness);
            pinConstraint(this.boxLeftWall, this.base, {
                x: this.boxLeftWall.width/2,
                y: this.boxLeftWall.height/2
            }, boxStiffness);
            pinConstraint(this.boxRightWall, this.base, {
                x: -this.boxRightWall.width/2,
                y: this.boxRightWall.height/2
            }, boxStiffness);
            pinConstraint(this.boxRightWall, this.base, {
                x: this.boxRightWall.width/2,
                y: this.boxRightWall.height/2
            }, boxStiffness);
            
            // Bind wedge to base
            this.wedge.body.collisionFilter.group = -1;
            pinConstraint(this.base, this.wedge, {
                x: this.base.width/2,
                y: -this.base.height/2
            });
            pinConstraint(this.base, this.wedge, {
                x: this.base.width/2,
                y: this.base.height/2
            });

            // Bind each wheel to base
            this.backWheel.body.collisionFilter.group = -1;
            this.midWheel.body.collisionFilter.group = -1;
            this.frontWheel.body.collisionFilter.group = -1;
            let wheelStiffness = 0.6;
            pinConstraint(this.base, this.backWheel, {
                x: -this.base.width*2/6,
                y: this.base.height/2 - this.backWheel.radius + Train.wheelLift
            }, wheelStiffness);
            pinConstraint(this.base, this.midWheel, {
                x: 0,
                y: this.base.height/2 - this.midWheel.radius + Train.wheelLift
            }, wheelStiffness);
            pinConstraint(this.base, this.frontWheel, {
                x: this.base.width*2/6,
                y: this.base.height/2 - this.frontWheel.radius + Train.wheelLift
            }, wheelStiffness);

            // Bind stack to base
            this.stack.body.collisionFilter.group = -1;
            pinConstraint(this.stack, this.base, {
                x: -this.stack.width/2,
                y: this.stack.height/2
            });
            pinConstraint(this.stack, this.base, {
                x: this.stack.width/2,
                y: this.stack.height/2
            });
            
            // Bind stack mouth to stack
            this.stackMouth.body.collisionFilter.group = -1;
            pinConstraint(this.stack, this.stackMouth, {
                x: -this.stack.width/2,
                y: -this.stack.height/2
            });
            pinConstraint(this.stack, this.stackMouth, {
                x: this.stack.width/2,
                y: -this.stack.height/2
            });
        }

        display(p5) {
            p5.noStroke();
            p5.fill(0, 100, 30);
            this.boxLeftWall.display(p5);
            this.boxRightWall.display(p5);
            this.boxTopWall.display(p5);
            this.base.display(p5);

            p5.push();
            p5.translate(this.boxTopWall.body.position.x - this.boxLeftWall.height/2 * Math.sin(this.boxTopWall.body.angle),
                this.boxTopWall.body.position.y  + this.boxLeftWall.height/2 * Math.cos(this.boxTopWall.body.angle));
                p5.rotate(this.base.body.angle);
            drawCenteredImage(p5, Train.varunjitImage, 0, 0, this.boxTopWall.width - this.boxLeftWall.width*2,
                this.boxLeftWall.height - this.boxTopWall.height);
            p5.pop();

            this.wedge.display(p5);
            this.stack.display(p5);
            this.stackMouth.display(p5);

            p5.fill(255);
            p5.push();
            p5.translate(this.backWheel.body.position.x, this.backWheel.body.position.y);
            p5.rotate(this.backWheel.body.angle);
            drawCenteredImage(p5, Train.wheelImage, 0, 0, this.backWheel.radius*2, this.backWheel.radius*2);
            p5.pop();
            p5.push();
            p5.translate(this.midWheel.body.position.x, this.midWheel.body.position.y);
            p5.rotate(this.midWheel.body.angle);
            drawCenteredImage(p5, Train.wheelImage, 0, 0, this.midWheel.radius*2, this.midWheel.radius*2);
            p5.pop();
            p5.push();
            p5.translate(this.frontWheel.body.position.x, this.frontWheel.body.position.y);
            p5.rotate(this.frontWheel.body.angle);
            drawCenteredImage(p5, Train.wheelImage, 0, 0, this.frontWheel.radius*2, this.frontWheel.radius*2);
            p5.pop();
        }

        applyGas(torque=-1.5) {
            if (this.backWheel.body.angularSpeed < Train.maxWheelSpeed)
                this.backWheel.applyTorque(torque);
            if (this.midWheel.body.angularSpeed < Train.maxWheelSpeed)
                this.midWheel.applyTorque(torque);
            if (this.frontWheel.body.angularSpeed < Train.maxWheelSpeed)
                this.frontWheel.applyTorque(torque);
        }

        setWheelVelocity(angularVelocity) {
            this.backWheel.setAngularVelocity(angularVelocity);
            this.midWheel.setAngularVelocity(angularVelocity);
            this.frontWheel.setAngularVelocity(angularVelocity);
        }
    }

    Train.boxThickness = 20;
    Train.boxWidth = 130;
    Train.boxHeight = 125;
    Train.stackWidth = 40;
    Train.stackHeight = 60;
    Train.stackMouthWidth = 80;
    Train.stackMouthHeight = 30;
    Train.baseHeight = 140;
    Train.baseWidth = 425;
    Train.backWheelRadius = 60;
    Train.midWheelRadius = 45;
    Train.frontWheelRadius = 45;
    Train.wheelLift = 20;
    Train.wedgeLength = 75;
    Train.maxWheelSpeed = 0.4;
    


    let ground;
    let balls;
    let train;
    let tracks;
    let trackGap = 35;
    let hills;
    let grassImage;
    let grassWidth = 200;
    let flashLength = 30;

    function truemod(x, p) {
        return x >= 0 ? x % p : x % p + p
    }

    return (
        <Sketch
        setup={ p5 => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            p5.colorMode(p5.HSB);
            console.log('get out me console')
            Train.wheelImage = p5.loadImage('wheel1.png');
            Train.varunjitImage = p5.loadImage('Varunjit.jpg');
            grassImage = p5.loadImage('grass.jpg');
    
            engine = Engine.create();
    
            ground = new Box(0, p5.height-200, p5.width, 200, { isStatic: true });
            let leftBound = new Box(0, 0, 75, p5.height, { isStatic: true, collisionFilter: { category: category(3) } });
            let rightBound = new Box(p5.width-75, 0, 75, p5.height, { isStatic: true, collisionFilter: { category: category(3) } });
    
            balls = [];
    
            train = new Train(100, 300);
    
            tracks = [];
            let trackWidth = 14;
            let trackHeight = 14;
            for (let i = 0; i < p5.width; i += trackWidth + trackGap) {
                tracks.push(new Box(i, p5.height-ground.height-trackHeight, trackWidth,
                    trackHeight, { isStatic: true, collisionFilter: { group: -2 }, friction: 0.9 }));
            }
    
            hills = [];
            for (let i = 0; i < 4; i++) {
                hills.push({
                    x: p5.width*i/4 + symrand(50),
                    y: p5.height- symrand(35),
                    d: 900 + symrand(75),
                    c: p5.color(130, 100, 60 + symrand(10))
                })
            }
            p5.textFont('Times New Roman');
            p5.textSize(200);
            p5.textAlign(p5.CENTER);
        }}

        draw={p5 => {
            Engine.update(engine);
            p5.background('#B3F2FF');
            p5.fill(0);
            if (p5.frameCount < flashLength) {
                p5.text('ARROW', p5.width/2, 400);
            }
            else if ( p5.frameCount < flashLength*2) {
                p5.text('KEYS', p5.width/2, 400);
            }
            else if ( p5.frameCount < flashLength*3) {
                p5.text('MOUSE', p5.width/2, 400);
            }
            p5.fill(255);
            p5.text('Happy Birthday Varunjit', p5.width-1.5*p5.frameCount, p5.height - p5.frameCount);
            for (let hill of hills) {
                p5.noStroke();
                p5.fill(hill.c);
                p5.ellipse(hill.x, hill.y, hill.d);
            }
            
            p5.fill('#CD853F')
            p5.noStroke();
            p5.rect(0, p5.height - 200 - 17, p5.width, 17);
            train.display(p5);
            // ground.display();
            for (let i = 0; i < p5.width + grassWidth; i += grassWidth) {
                p5.image(grassImage, truemod(i - (p5.frameCount*2.0),
                    p5.width + grassWidth) - grassWidth, p5.height - 200,
                    grassWidth, grassWidth);
            }
            for (let i = 0; i < balls.length; i++) {
                p5.fill(balls[i].color);
                balls[i].display(p5);
            }
            balls = balls.filter(ball => {
                return ball.body.position.x > -2*ball.radius && ball.body.position.y < p5.width + 2*ball.radius;
            })
            p5.fill(50);
            for (let track of tracks) {
                Body.setPosition(track.body, { x: track.body.position.x - 2.0, y: track.body.position.y });
                if (track.body.position.x + track.width < 0) {
                    Body.setPosition(track.body, {
                        x: track.body.position.x + (track.width + trackGap) * (tracks.length),
                        y: track.body.position.y });
                }
                track.display(p5);
            }
            if (p5.keyIsPressed) {
                if (p5.keyCode == p5.LEFT_ARROW) {
                    train.applyGas(-4.0);
                    // train.setWheelVelocity(-0.1);
                } else if (p5.keyCode == p5.RIGHT_ARROW) {
                    train.applyGas(4.0);
                    // train.setWheelVelocity(0.1);
                }
            }
        }}

        mouseClicked={p5 => {
            if (p5.mouseY < p5.height - ground.height - 25) {
                let c = new Circle(p5.mouseX, p5.mouseY, 50, {
                    collisionFilter: { mask: category(3, true) },
                    friction: 0.8
                });
                c.color = p5.color(p5.random(360), 100, 100);
                let vel = { x: (train.base.body.position.x + symrand(Train.baseWidth/2) - p5.mouseX),
                    y: (train.base.body.position.y + symrand(Train.baseHeight/2) - p5.mouseY)};
                vel = {
                    x: 50 * vel.x / Math.sqrt(vel.x**2 + vel.y**2),
                    y: 50 * vel.y / Math.sqrt(vel.x**2 + vel.y**2)
                };
                Body.setVelocity(c.body, vel);
                balls.push(c);
            }
        }}

        className={styles.canvas}
        />
    );
}