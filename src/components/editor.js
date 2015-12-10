const ENTER_KEY = 13;

const Editor = React.createClass({
  propTypes: {
    content: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    onEnter: React.PropTypes.func,
    onAltEnter: React.PropTypes.func,
    onCtrlEnter: React.PropTypes.func,
    onShiftEnter: React.PropTypes.func,
  },

  getInitialState() {
    return {
      content: this.props.content,
    };
  },

  componentDidUpdate() {
    // content changed
    // the content has reinserted, so the selection has lost
    this.restoreRange();
  },

  getContent() {
    let content = this.state.content;
    // TODO 做层过滤&转换
    content = content.replace(/<br[^>]*>/g, '\n');
    content = content.replace(/<img[^>]*alt="([^"]+)[^>]*>/g, '/$1');
    content = content.replace(/<img[^>]*>/g, '');
    content = content.trim();

    return content;
  },

  setBreakLine() {
    const s = window.getSelection();
    const r = document.createRange();
    s.deleteFromDocument();

    if (s.anchorNode instanceof Text) {
      s.anchorNode.insertData(s.anchorOffset, '\n');
      r.setEnd(s.anchorNode, s.anchorOffset + 1);
      r.collapse();
      s.removeAllRanges();
      s.addRange(r);
    } else {
      const nextNode = s.anchorNode.childNodes[s.anchorOffset + 1];
      console.log(nextNode);
      if (nextNode instanceof Text) {
        nextNode.insertData(0, '\n');
        r.setEnd(nextNode, 1);
        r.collapse();
        s.removeAllRanges();
        s.addRange(r);
      } else {
        const n = document.createTextNode('\n');
        const r1 = s.getRangeAt(0);
        r1.insertNode(n);
        r1.collapse();
        s.removeAllRanges();
        s.addRange(r);
      }
    }

    this.saveRange();
    this.setState({
      content: this.refs.editor.getDOMNode().innerHTML,
    });
  },

  insertHTML(_html) {
    const html = `${_html}<img style="width: 1px; height: 1px;">`;
    const s = window.getSelection();
    const r = s.getRangeAt(0);
    const f = r.createContextualFragment(html);

    r.deleteContents();
    r.insertNode(f); // 尾部换行不行，再insert一个，才能激活，why?
    r.collapse(false);
    s.removeAllRanges();
    s.addRange(r);

    document.execCommand('Delete', false, null);
    this.saveRange();
  },

  // 保存光标位置
  saveRange() {
    const s = window.getSelection();

    // 记住相对于父节点的下标
    // 通过下标定位到哪个textNode
    // 再通过offset定位到text的位置
    let node = s.anchorNode;
    if (node instanceof Text) {
      this._type = Node.TEXT_NODE;
      this._index = 0;
      while (node.previousSibling) {
        this._index ++;
        node = node.previousSibling;
      }
    } else {
      this._type = Node.ELEMENT_NODE;
      this._index = Math.max(0, s.anchorOffset - 1);
    }

    this._offset = s.anchorOffset;
  },

  restoreRange() {
    const s = window.getSelection();
    const r = document.createRange();
    const editor = this.refs.editor.getDOMNode();
    const node = editor.childNodes[this._index];

    console.log('restoreRange', node, this._index, this._offset);

    if (node && Node.TEXT_NODE === this._type) {
      r.setEnd(node, this._offset);
      r.collapse();
      s.removeAllRanges();
      s.addRange(r);
    } else if (node && Node.ELEMENT_NODE === this._type) {
      r.setEndAfter(node);
      r.collapse();
      s.removeAllRanges();
      s.addRange(r);
    } else {
      console.log('restoreRange can not find node');
    }
  },

  filterElement(node, parent) {
    const tagName = node.tagName.toUpperCase();

    if (tagName === 'IMG') {
      if (node.dataset.is === 'emotion') {
        return;
      }
    }

    let text;
    if (tagName === 'BR') {
      text = '\n';
    } else {
      text = node.innerText;
    }

    const textNode = document.createTextNode(text);
    parent.replaceChild(textNode, node);
  },

  // only support emotion images, which img tag has `data-is="emotin"` attribute
  // other html would be filter to text
  filterHTML(parent) {
    const children = parent.childNodes;

    Array.from(children, (node) => {
      switch (node.nodeType) {
      case node.ELEMENT_NODE: this.filterElement(node, parent); break;
      case node.TEXT_NODE: break;
      default: parent.removeChild(node);
      }
    });
  },

  handleCompositionStart() {
    this._isCompositing = true;
  },

  handleCompositionEnd() {
    this._isCompositing = false;
  },

  handleInput() {
    if (this._isCompositing) return;
    this.saveRange();
    this.filterHTML(this.refs.editor.getDOMNode());
    this.setState({
      content: this.refs.editor.getDOMNode().innerHTML,
    });
  },

  handleKeyDown(e) {
    if (ENTER_KEY === e.keyCode) {
      if (e.altKey) {
        this.props.onAltEnter && this.props.onAltEnter(e);
      } else if (e.ctrlKey) {
        this.props.onCtrlEnter && this.props.onCtrlEnter(e);
      } else if (e.shiftKey) {
        this.props.onShiftEnter && this.props.onShiftEnter(e);
      } else {
        this.props.onEnter && this.props.onEnter(e);
      }
    }
  },

  handleKeyUp() {
    this.saveRange();
  },

  handleMouseUp() {
    this.saveRange();
  },

  render() {
    return (
      <pre
        className={this.props.className}
        contentEditable="true"
        ref="editor"
        onCompositionStart={this.handleCompositionStart}
        onCompositionEnd={this.handleCompositionEnd}
        onInput={this.handleInput}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        onMouseUp={this.onMouseUp}
        dangerouslySetInnerHTML={{__html: this.state.content}} />
    );
  },
});

module.exports = Editor;
