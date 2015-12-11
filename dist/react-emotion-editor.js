'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ENTER_KEY = 13;

var Editor = _react2.default.createClass({
  displayName: 'Editor',

  propTypes: {
    content: _react2.default.PropTypes.string.isRequired,
    className: _react2.default.PropTypes.string,
    onEnter: _react2.default.PropTypes.func,
    onAltEnter: _react2.default.PropTypes.func,
    onCtrlEnter: _react2.default.PropTypes.func,
    onShiftEnter: _react2.default.PropTypes.func
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setContent(nextProps.content);
  },
  setContent: function setContent(content) {
    (0, _reactDom.findDOMNode)(this).innerHTML = content;
  },
  getContent: function getContent() {
    var content = (0, _reactDom.findDOMNode)(this).innerHTML;
    // filter html except emotion
    content = content.replace(/<br[^>]*>/g, '\n');
    content = content.replace(/<img(?!.*data-is=[\'\"]emotion[\'\"])[^>]*>/g, '');
    content = content.trim();

    return content;
  },
  insertHTML: function insertHTML(_html) {
    (0, _reactDom.findDOMNode)(this).focus();
    this.restoreRange();

    // fail to set a break line at the end of content
    // so append a img ele and then delete to resolve it
    var html = _html + '<img style="width: 1px; height: 1px;">';
    var s = window.getSelection();
    var r = s.getRangeAt(0);
    var f = r.createContextualFragment(html);

    r.deleteContents();
    r.insertNode(f);
    r.collapse(false);
    s.removeAllRanges();
    s.addRange(r);

    document.execCommand('Delete', false, null); // this will trigger input

    this.saveRange();
  },
  saveRange: function saveRange() {
    var s = window.getSelection();
    var r = s.getRangeAt(0);

    this._range = r;
  },
  restoreRange: function restoreRange() {
    var s = window.getSelection();
    if (this._range) {
      s.removeAllRanges();
      s.addRange(this._range);
    } else {
      (0, _reactDom.findDOMNode)(this).focus();
    }
  },
  filterElement: function filterElement(node, parent) {
    var tagName = node.tagName.toUpperCase();

    if (tagName === 'IMG') {
      if (node.dataset.is === 'emotion') {
        return;
      }
    }

    var text = undefined;
    if (tagName === 'BR') {
      text = '\n';
    } else {
      text = node.innerText;
    }

    var textNode = document.createTextNode(text);
    parent.replaceChild(textNode, node);
  },

  // only support emotion images, which img tag has `data-is="emotin"` attribute
  // other html would be filter to text
  filterHTML: function filterHTML(parent) {
    var _this = this;

    var children = parent.childNodes;

    Array.from(children, function (node) {
      switch (node.nodeType) {
        case node.ELEMENT_NODE:
          _this.filterElement(node, parent);break;
        case node.TEXT_NODE:
          break;
        default:
          parent.removeChild(node);
      }
    });
  },
  handleCompositionStart: function handleCompositionStart() {
    this._isCompositing = true;
  },
  handleCompositionEnd: function handleCompositionEnd() {
    this._isCompositing = false;
  },
  handleInput: function handleInput() {
    if (this._isCompositing) return;
    this.filterHTML((0, _reactDom.findDOMNode)(this));
  },
  handleKeyDown: function handleKeyDown(e) {
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
  handleKeyUp: function handleKeyUp() {
    this.saveRange();
  },
  handleMouseUp: function handleMouseUp() {
    this.saveRange();
  },
  render: function render() {
    return _react2.default.createElement('pre', {
      className: this.props.className,
      contentEditable: 'true',
      ref: 'editor',
      onCompositionStart: this.handleCompositionStart,
      onCompositionEnd: this.handleCompositionEnd,
      onInput: this.handleInput,
      onKeyDown: this.handleKeyDown,
      onKeyUp: this.handleKeyUp,
      onMouseUp: this.onMouseUp });
  }
});

module.exports = Editor;