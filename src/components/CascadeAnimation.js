import React, { Component } from 'react';
import { waitPromise } from '../utils';

class CascadeAnimation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeString: '',
      lines: []
    }
    this.origLines = this.props.children.split('\n');
  }

  componentDidMount() {
    this.animate();
  }

  async animate() {
    let lineNum = 0;
    for (let line of this.origLines) {
      if (lineNum === this.props.maxLines) break;
      for (let i = 0; i < line.length; i += this.props.chunkSize) {
        this.setState({
          activeString: this.state.activeString + line.slice(i, i+this.props.chunkSize)
        });
        await waitPromise(this.props.speed);
      }
      let s = this.state.activeString;
      this.setState({
        lines: [...this.state.lines, s],
        activeString: ''
      });
      lineNum++;
    }
  }
  
  render() {
    return(
      <div className='cascade'>
        {this.state.lines.concat([this.state.activeString]).map((x,i) => {
          if (x === '') return <div key={i}>&nbsp;</div>
          return <div key={i} style={this.props.styler(i)}>
            {x.charAt(0) === ' ' ? x.replace(/ /g, '\xa0') : x}
          </div>;
        })}
      </div>
    );
  }
}

CascadeAnimation.defaultProps = {
  styler: {},
  speed: 1,
  maxLineNum: -1,
  chunkSize: 1
};

export default CascadeAnimation;