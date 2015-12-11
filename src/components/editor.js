import React from 'react';
import {findDOMNode} from 'react-dom';

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

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps.content);
  },

  setContent(content) {
    findDOMNode(this).innerHTML = content;
  },

  getContent() {
    let content = findDOMNode(this).innerHTML;
    // filter html except emotion
    content = content.replace(/<br[^>]*>/g, '\n');
    content = content.replace(/<img(?!.*data-is=[\'\"]emotion[\'\"])[^>]*>/g, '');
    content = content.trim();

    return content;
  },

  insertHTML(_html) {
    findDOMNode(this).focus();
    this.restoreRange();

    const html = `${_html}<img style="width: 1px; height: 1px;">`;
    const s = window.getSelection();
    const r = s.getRangeAt(0);
    const f = r.createContextualFragment(html);

    r.deleteContents();
    r.insertNode(f); // 尾部换行不行，再insert一个，才能激活，why?
    r.collapse(false);
    s.removeAllRanges();
    s.addRange(r);

    document.execCommand('Delete', false, null); // this will trigger input

    this.saveRange();
  },

  // 保存光标位置
  saveRange() {
    const s = window.getSelection();
    const r = s.getRangeAt(0);

    this._range = r;
  },

  restoreRange() {
    const s = window.getSelection();
    if (this._range) {
      s.removeAllRanges();
      s.addRange(this._range);
    } else {
      findDOMNode(this).focus();
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
    this.filterHTML(findDOMNode(this));
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
        onMouseUp={this.onMouseUp} />
    );
  },
});

module.exports = Editor;
