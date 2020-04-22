import React, { Component } from 'react';

/* 
 * Helper function that, used like "await waitPromise(millis)" in an async
 * function, will sleep the execution of the function for a specified number of
 * milliseconds.
 * TODO: Add to some utility module for the project. Will probably use later.
 */
function waitPromise(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

/*
 * Wraps a piece of text and "types" the text out to the user. Some deletions
 * are added randomly into the animation queue.
 */
class TypingAnimation extends Component {
  constructor(props) {
    super(props);
    // The viewString is the string that is displayed to the user. It updates as
    // the character list is emptied.
    this.state = {
      viewString: ''
    };
    console.log(this.props);
    this.animationList = [];
    this.origString = this.props.children.props.children;
    this.cursorBlinking = true;
  }

  componentDidMount() {
    this.interval = setInterval(() => { this.forceUpdate() }, 1000);
    this.populateAnimationList();
    this.animate();
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  // Generates a sleep time between hard coded limits.
  generateAnimationTime() {
    return Math.floor(this.props.speed + this.props.speed/2*Math.random());
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
        time: this.generateAnimationTime()
      });
      if (Math.random() < 0.1) {
        this.animationList.push({
          char: String.fromCharCode(97 + Math.floor(Math.random()*26)),
          time: this.generateAnimationTime()
        });
        this.animationList.push({
          char: 'DEL',
          time: this.generateAnimationTime()
        });
      }
    }
  }

  async animate() {
    for (let { char, time } of this.animationList) {
      if (char != 'DEL') {
        this.setState({
          viewString: this.state.viewString + char
        });
      } else {
        this.setState({
          viewString: this.state.viewString.substring(0, 
            this.state.viewString.length-1)
        })
      }
      await waitPromise(time);
    }
    this.cursorBlinking = false;
  }

  render() {
    return React.createElement(this.props.children.type,
      { className: this.props.children.props.className },
      this.state.viewString + ((new Date()).getSeconds() % 2 === 0 && this.cursorBlinking
        ? '_' : '') );
  }
}

export default TypingAnimation;