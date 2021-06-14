import {vector, add} from './Vector'

interface Vector {
    x: number
    y: number
}

export class Particle {
    pos: Vector
    vel: Vector
    acc: Vector

    constructor(x, y) {
        this.pos = vector(x, y)
        this.vel = vector(0, 0)
        this.acc = vector(0, 0)
    }

    update = () => {
        this.vel = add(this.vel, this.acc)
        this.pos = add(this.pos, this.vel)
    }

    draw = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#F00'
        // ctx.ellipse(this.pos.x, this.pos.y, 1000, 1000, 0, 0, Math.PI)
        ctx.fillRect(this.pos.x, this.pos.y, 10, 10)
    }
}