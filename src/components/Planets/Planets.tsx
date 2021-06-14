import React, { ReactHTMLElement, Ref, useEffect, useRef } from 'react';
import styles from './Planets.module.css';
import {Particle} from './Particle'

class Sim {
    particles: Array<Particle>
    constructor() {
        this.particles = []
        for (let i = 0; i < 10; i++) {
            this.particles.push( new Particle(10, 10) )
        }
    }
    draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, frameCount: number) => {
        // Background
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        for (const p of this.particles) {
            p.draw(ctx)
        }
    }
}

function FullscreenCanvas({draw}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    function animate(canvas, ctx, draw: Function, frameCount=0) {
        draw(canvas, ctx, frameCount)
        requestAnimationFrame(() => {
            animate(canvas, ctx, draw, frameCount+1)
        })
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas)
            return
        canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight)
        const ctx = canvas?.getContext('2d')
        animate(canvas, ctx, draw)
    })
    
    return(
        <canvas
            className={styles.fullscreenCanvas}
            ref={canvasRef}
        />
    )
}

export default function Planets() {
    const sim = new Sim()
    return(
        <FullscreenCanvas draw={sim.draw}/>
    );
}