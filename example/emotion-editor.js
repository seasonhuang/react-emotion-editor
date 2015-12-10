var Editor = require('../index');

var App = React.createClass({
  getInitialState() {
    return {
      content: '',
      records: [],
    };
  },

  handleEnter() {
    const content = this.refs.editor.getContent();
    this.setState({
      content: '',
      records: this.state.records.concat(content),
    });
  },

  handleCtrlEnter() {
    this.refs.editor.insertHTML('\n');
  },

  render() {
    return (
      <div>
        <Editor
          ref="editor"
          content={this.state.content}
          onChange={this.handleChange}
          onEnter={this.handleEnter}
          onCtrlEnter={this.handleCtrlEnter} />
      </div>
    );
  },
});

ReactDOM.render(<App />, document.getElementById('app'));
