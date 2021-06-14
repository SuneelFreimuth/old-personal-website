import React from 'react';
import styles from './Battleship.module.css';
import Sketch from 'react-p5'
import {Game, Player} from './BattleshipGame'

export default class Battleship extends React.Component<{}, any> {
    public game: Game
    constructor(props) {
        super(props);
        this.game = new Game()
        this.state = {
            tileSize: 20,
            showGridLines: true
        }
    }

    renderBoard = (p5, game: Game) => {
        p5.noStroke()
        for (const player of game.players) {
            for (const ship of player.ships) {
                for (const [r, c] of ship) {
                    p5.fill(100)
                    p5.rect(c*this.state.tileSize, r*this.state.tileSize, this.state.tileSize, this.state.tileSize)
                }
            }
            for (const [r, c] of player.hits) {
                p5.fill(255, 0, 0)
                p5.ellipse((c+0.5)*this.state.tileSize, (r+0.5)*this.state.tileSize, this.state.tileSize, this.state.tileSize)
            }
        }
        if (this.state.showGridLines) {
            p5.stroke(50, 30)
            for (let i = 0; i < p5.width; i += this.state.tileSize) {
                p5.line(i, 0, i, p5.height)
                p5.line(0, i, p5.width, i)
            }
        }
    }

    setup = (p5) => {
        p5.createCanvas(500, 500)
    }

    draw = (p5) => {
        p5.background(50, 200, 255)
        this.renderBoard(p5, this.game)
        p5.fill(255, 255, 0, 100)
        p5.rect(
            p5.mouseX - p5.mouseX % this.state.tileSize,
            p5.mouseY - p5.mouseY % this.state.tileSize,
            this.state.tileSize,
            this.state.tileSize
        )
    }

    mouseClicked = p5 => {
    }

    render() {
        return(
            <div>
                <Sketch 
                    setup={this.setup}
                    draw={this.draw}
                />
            </div>
            
        );
    }
}