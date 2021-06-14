import React from "react";
import "./stylesheets/App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import {
	State, Sun, Train, Snake, Minesweeper, Blog, Battleship,
	Planets
} from "./components";

export default function App() {
	return (
		<Router>
			<div>
				<Switch>
					<Route path="/2train" component={Train} />
					<Route path="/snake" component={Snake} />
					<Route path="/minesweeper" component={Minesweeper} />
					<Route path="/blog" component={Blog} />
					<Route path="/battleship" component={Battleship} />
					<Route path="/state" component={State} />
					<Route path="/planets" component={Planets} />
					<Route exact path="/" component={Sun} />
				</Switch>
			</div>
		</Router>
	);
}
