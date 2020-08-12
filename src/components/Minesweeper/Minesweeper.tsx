import React, { useState } from "react";
import Sketch from "react-p5";

import styles from "./Minesweeper.module.css";
import GameDisplay from "./GameDisplay";
import MinesweeperGame, { RunState } from "./Game";

export default function Minesweeper() {
	const [rows, setRows] = useState<number>(20);
	const [cols, setCols] = useState<number>(20);
	const [game, setGame] = useState<MinesweeperGame | null>(null);

	function onRowsChange(e) {
		setRows(Number(e.target.value));
	}

	function onColsChange(e) {
		setCols(Number(e.target.value));
	}

	function gameDisplayMouseClick(mouseButton, r, c) {
		if (game !== null) {
			let game_: MinesweeperGame | null = game.clone();
			switch ((game_ as MinesweeperGame).runState) {
				case RunState.GAME_RUNNING:
					if (mouseButton === "LEFT") {
						(game_ as MinesweeperGame).processMove([r, c]);
					}
					break;
				case RunState.GAME_WIN:
				case RunState.GAME_LOSE:
					game_ = null;
					break;
			}
			setGame(game_);
		}
	}

	function startGame() {
		const newGame = new MinesweeperGame(rows, cols);
		newGame.loadRandomMines(0.1);
		setGame(newGame);
	}

	const controlsVisible = game === null;
	const gameVisible = game !== null;

	function showControls(controlsVisible: boolean) {
		if (controlsVisible) {
			return (
				<div className={styles.controls}>
					<label htmlFor="rows">Rows</label>
					<input
						type="text"
						id="rows"
						value={rows}
						onChange={onRowsChange}
					/>
					<label htmlFor="">Columns</label>
					<input
						type="text"
						id="cols"
						value={cols}
						onChange={onColsChange}
					/>
					<button onClick={startGame}>Start game!</button>
				</div>
			);
		} else {
			let content = "Good luck!";
			if (game !== null) {
				if (game.runState === RunState.GAME_WIN) {
					content = "You win!";
				} else if (game.runState === RunState.GAME_LOSE) {
					content = "Aww...";
				}
			}
			return (
				<div
					style={{
						fontSize: "1.5rem"
					}}
				>
					{content}
				</div>
			);
		}
	}

	function showGame(gameVisible: boolean) {
		if (gameVisible) {
			return (
				<GameDisplay game={game} onMouseClick={gameDisplayMouseClick} />
			);
		}
	}

	return (
		<div className={styles.main}>
			{showControls(controlsVisible)}
			{showGame(gameVisible)}
		</div>
	);
}
