import React from "react";
import './stylesheets/App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { Home, Sun, Train, Snake } from './components';

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/2train" component={Train}/>
          <Route path="/snake" component={Snake}/>
          <Route path="/blog" component={Blog}/>
          <Route exact path="/" component={Sun}/>
        </Switch>
      </div>
    </Router>
  );
}
