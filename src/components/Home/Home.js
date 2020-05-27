import React from 'react';
import TypingAnimation from '../TypingAnimation';
import CascadeAnimation from '../CascadeAnimation';
import { constrain } from '../../utils';
import styles from './Home.module.css';

const fileString = `import React, { Component } from 'react';

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
      viewString: '',
      cursorColor: 'black'
    };
    this.animationList = [];
    this.origString = this.props.children.props.children;
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
  }

  render() {
    return React.createElement(this.props.children.type,
      { className: this.props.children.props.className },
      this.state.viewString,
      <span style={{color: this.state.cursorColor}}>_</span>
    );
  }
}

export default TypingAnimation;`;

function styler(i) {
  let c = constrain(2*i + 175, 175, 255);
  return {
    color: `rgb(${c}, ${c}, ${c})`
  };
}

class Home extends React.Component {
  render() {
    let typeAnim = <TypingAnimation><h1 className={styles.title}>Suneel Freimuth</h1></TypingAnimation>;
    let fileCascade = (
      <CascadeAnimation styler={styler} maxLines={40} chunkSize={8}
          await={typeAnim.animationPromise}>
        {fileString}
      </CascadeAnimation>);

    return(
      <div className={styles.container}>
        {typeAnim}
        {fileCascade}
      </div>
    );
  }
}

/*
{fileString.split('\n').map((x,i) => {
  if (x == '') return <div key={i}>&nbsp;</div>;
  let c = constrain(2*i + 175, 175, 255);
  return <div key={i} style={{color: `rgb(${c}, ${c}, ${c})`}}>
    {x.charAt(0) == ' ' ? x.replace(/ /g, '\xa0') : x}
  </div>;
})}
*/

export default Home;