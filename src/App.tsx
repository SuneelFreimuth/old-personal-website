import React from "react";
import "./stylesheets/App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Sun, Train, Snake, Minesweeper, Blog } from "./components";

export default function App() {
	return (
		<Router>
			<div>
				<Switch>
					<Route path="/2train" component={Train} />
					<Route path="/snake" component={Snake} />
					<Route path="/minesweeper" component={Minesweeper} />
					<Route path="/blog" component={Blog} />
					<Route exact path="/" component={Sun} />
				</Switch>
			</div>
		</Router>
	);
}
