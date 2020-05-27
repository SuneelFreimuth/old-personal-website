import React, { Component } from 'react';
import { waitPromise } from '../utils';

/*
 * Wraps a piece of text and "types" the text out to the user. Some deletions
 * are added randomly into the animation queue.
 */
export default class TypingAnimation extends Component {
  constructor(props) {
    super(props);
    // The viewString is the string that is displayed to the user. It updates as
    // the character list is emptied.
    this.state = {
      viewString: '',
      cursorColor: 'black',
      finished: false
    };
    this.animationList = [];
    this.origString = this.props.children.props.children;
    this.finished = this.finished.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({cursorColor: (this.state.cursorColor === 'black') ?
        'white' : 'black'})
    }, 750);
    this.populateAnimationList();
    this.animate();
  }

  // Remove the interval for the blinking cursor.
  componentWillUnmount() {
    clearInterval(this.interval)
  }

  finished() {
    return this.state.finished;
  }

  // Time interval based on the "speed" prop.
  randomInterval() {
    let s = (this.props.speed) ? this.props.speed : 75;
    return Math.floor(s + s/2*Math.random());
  }

  // Generates
  randomLetter() {
    return String.fromCharCode(97 + Math.floor(Math.random()*26));
  }

  /* 
   * Adds an object for each character in the wrapped text, containing a 
   * character to type and a time to sleep before typing the next character.
   * There is a small chance a wrong character will be placed into the animation
   * list, followed by the deletion of the wrong character.
   */
  populateAnimationList() {
    for (let char of this.origString.split('')) {
      this.animationList.push({
        char,
        time: this.randomInterval()
      });
      if (Math.random() < 0.1) {
        this.animationList.push({
          char: this.randomLetter(),
          time: this.randomInterval()
        }, {
          char: 'DEL',
          time: this.randomInterval()
        });
      }
    }
  }

  async animate() {
    for (let { char, time } of this.animationList) {
      this.setState({
        viewString: (char === 'DEL') ?
          this.state.viewString.substring(0, this.state.viewString.length-1) :
          this.state.viewString + char
      });
      await waitPromise(time);
    }
    this.setState({finished: true});
  }

  render() {
    return React.createElement(this.props.children.type,
      { className: this.props.children.props.className },
      this.state.viewString,
      <span style={{color: this.state.cursorColor}}>_</span>
    );
  }
}