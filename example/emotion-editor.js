var React = require('react');
var ReactDOM = require('react-dom');
var Editor = require('../index');

var App = React.createClass({
  getInitialState() {
    return {
      content: '',
      records: [],
    };
  },

  handleChooseEmotion(evt) {
    const target = evt.target;
    const img = `<img src="${target.src}" data-is="emotion" />`;

    this.refs.editor.insertHTML(img);
  },

  handleEnter(evt) {
    const content = this.refs.editor.getContent();
    this.setState({
      content: '',
      records: this.state.records.concat(content),
    });
    evt.preventDefault();
  },

  handleCtrlEnter(evt) {
    this.refs.editor.insertHTML('\n');
    evt.preventDefault();
  },

  handleChange(content) {
    console.log('[content changed] ', content);
  },

  renderRecords() {
    return this.state.records.map((record, index) => {
      return (
        <li key={index}>
          <pre className="item" dangerouslySetInnerHTML={{__html: record}} />
        </li>
      );
    });
  },

  renderEmotion() {
    let i = 0;
    const emotion = [];
    while (i < 100) {
      emotion.push(
        <img
          key={i}
          src={`http://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${i}.gif`}
          onClick={this.handleChooseEmotion} />
      )
      i ++;
    }

    return emotion;
  },

  render() {
    return (
      <div className="main">
        <ul className="record">
          {this.renderRecords()}
        </ul>
        <Editor
          ref="editor"
          className="editor"
          content={this.state.content}
          onChange={this.handleChange}
          onEnter={this.handleEnter}
          onCtrlEnter={this.handleCtrlEnter} />
        <div className="emotion">
          {this.renderEmotion()}
        </div>
      </div>
    );
  },
});

ReactDOM.render(<App />, document.getElementById('app'));
