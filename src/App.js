import React from "react";
import './stylesheets/App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  // Link
} from "react-router-dom";

import { Home, Sun } from './components';

export default function App() {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route exact path="/" component={Sun}/>
          {/* <Route path="/sun" component={Sun} /> */}
        </Switch>
      </div>
    </Router>
  );
}