Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _mobx = require("mobx");

var _nteractDisplayArea = require("@nteract/display-area");

var _transforms = require("./transforms");

var _status = require("./status");

var _status2 = _interopRequireDefault(_status);

var SCROLL_HEIGHT = 600;

var ResultViewComponent = (function (_React$Component) {
  var _instanceInitializers = {};

  _inherits(ResultViewComponent, _React$Component);

  function ResultViewComponent() {
    var _this = this;

    _classCallCheck(this, _ResultViewComponent);

    _get(Object.getPrototypeOf(_ResultViewComponent.prototype), "constructor", this).apply(this, arguments);

    this.containerTooltip = new _atom.CompositeDisposable();
    this.buttonTooltip = new _atom.CompositeDisposable();
    this.closeTooltip = new _atom.CompositeDisposable();
    this.expanded = _mobx.observable.box(false);

    this.getAllText = function () {
      if (!_this.el) return "";
      return _this.el.innerText ? _this.el.innerText.trim() : "";
    };

    this.handleClick = function (event) {
      if (event.ctrlKey || event.metaKey) {
        _this.openInEditor();
      } else {
        _this.copyToClipboard();
      }
    };

    this.copyToClipboard = function () {
      atom.clipboard.write(_this.getAllText());
      atom.notifications.addSuccess("Copied to clipboard");
    };

    this.openInEditor = function () {
      atom.workspace.open().then(function (editor) {
        return editor.insertText(_this.getAllText());
      });
    };

    this.addCopyTooltip = function (element, comp) {
      if (!element || !comp.disposables || comp.disposables.size > 0) return;
      comp.add(atom.tooltips.add(element, {
        title: "Click to copy,\n          " + (process.platform === "darwin" ? "Cmd" : "Ctrl") + "+Click to open in editor"
      }));
    };

    this.addCloseButtonTooltip = function (element, comp) {
      if (!element || !comp.disposables || comp.disposables.size > 0) return;
      comp.add(atom.tooltips.add(element, {
        title: _this.props.store.executionCount ? "Close (Out[" + _this.props.store.executionCount + "])" : "Close result"
      }));
    };

    this.addCopyButtonTooltip = function (element) {
      _this.addCopyTooltip(element, _this.buttonTooltip);
    };

    this.onWheel = function (element) {
      return function (event) {
        var clientHeight = element.clientHeight;
        var scrollHeight = element.scrollHeight;
        var scrollTop = element.scrollTop;
        var atTop = scrollTop !== 0 && event.deltaY < 0;
        var atBottom = scrollTop !== scrollHeight - clientHeight && event.deltaY > 0;

        if (clientHeight < scrollHeight && (atTop || atBottom)) {
          event.stopPropagation();
        }
      };
    };

    _defineDecoratedPropertyDescriptor(this, "toggleExpand", _instanceInitializers);
  }

  _createDecoratedClass(ResultViewComponent, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props$store = this.props.store;
      var outputs = _props$store.outputs;
      var status = _props$store.status;
      var isPlain = _props$store.isPlain;
      var position = _props$store.position;

      var inlineStyle = {
        marginLeft: position.lineLength + position.charWidth + "px",
        marginTop: "-" + position.lineHeight + "px"
      };

      if (outputs.length === 0 || this.props.showResult === false) {
        var _kernel = this.props.kernel;
        return _react2["default"].createElement(_status2["default"], {
          status: _kernel && _kernel.executionState !== "busy" && status === "running" ? "error" : status,
          style: inlineStyle
        });
      }

      return _react2["default"].createElement(
        "div",
        {
          className: isPlain ? "inline-container" : "multiline-container",
          onClick: isPlain ? this.handleClick : undefined,
          style: isPlain ? inlineStyle : {
            maxWidth: position.editorWidth - 2 * position.charWidth + "px",
            margin: "0px"
          }
        },
        _react2["default"].createElement(
          "div",
          {
            className: "hydrogen_cell_display",
            ref: function (ref) {
              if (!ref) return;
              _this2.el = ref;

              isPlain ? _this2.addCopyTooltip(ref, _this2.containerTooltip) : _this2.containerTooltip.dispose();

              // As of this writing React's event handler doesn't properly handle
              // event.stopPropagation() for events outside the React context.
              if (!_this2.expanded.get() && !isPlain && ref) {
                ref.addEventListener("wheel", _this2.onWheel(ref), {
                  passive: true
                });
              }
            },
            style: {
              maxHeight: this.expanded.get() ? "100%" : SCROLL_HEIGHT + "px",
              overflowY: "auto"
            }
          },
          _react2["default"].createElement(_nteractDisplayArea.Display,
          // $FlowFixMe
          { outputs: (0, _mobx.toJS)(outputs),
            displayOrder: _transforms.displayOrder,
            transforms: _transforms.transforms,
            theme: "light",
            models: {},
            expanded: true
          })
        ),
        isPlain ? null : _react2["default"].createElement(
          "div",
          { className: "toolbar" },
          _react2["default"].createElement("div", {
            className: "icon icon-x",
            onClick: this.props.destroy,
            ref: function (ref) {
              return _this2.addCloseButtonTooltip(ref, _this2.closeTooltip);
            }
          }),
          _react2["default"].createElement("div", { style: { flex: 1, minHeight: "0.25em" } }),
          this.getAllText().length > 0 ? _react2["default"].createElement("div", {
            className: "icon icon-clippy",
            onClick: this.handleClick,
            ref: this.addCopyButtonTooltip
          }) : null,
          this.el && this.el.scrollHeight > SCROLL_HEIGHT ? _react2["default"].createElement("div", {
            className: "icon icon-" + (this.expanded.get() ? "fold" : "unfold"),
            onClick: this.toggleExpand
          }) : null
        )
      );
    }
  }, {
    key: "scrollToBottom",
    value: function scrollToBottom() {
      if (!this.el || this.expanded === true || this.props.store.isPlain === true || atom.config.get("Hydrogen.autoScroll") === false) return;
      var scrollHeight = this.el.scrollHeight;
      var height = this.el.clientHeight;
      var maxScrollTop = scrollHeight - height;
      this.el.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.scrollToBottom();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.scrollToBottom();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.containerTooltip.dispose();
      this.buttonTooltip.dispose();
      this.closeTooltip.dispose();
    }
  }, {
    key: "toggleExpand",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.expanded.set(!_this3.expanded.get());
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  var _ResultViewComponent = ResultViewComponent;
  ResultViewComponent = (0, _mobxReact.observer)(ResultViewComponent) || ResultViewComponent;
  return ResultViewComponent;
})(_react2["default"].Component);

exports["default"] = ResultViewComponent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3Jlc3VsdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O3FCQUN4QixPQUFPOzs7O3lCQUNBLFlBQVk7O29CQUNJLE1BQU07O2tDQUN2Qix1QkFBdUI7OzBCQUNOLGNBQWM7O3NCQUNwQyxVQUFVOzs7O0FBTTdCLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQzs7SUFVcEIsbUJBQW1COzs7WUFBbkIsbUJBQW1COztXQUFuQixtQkFBbUI7Ozs7Ozs7U0FFdkIsZ0JBQWdCLEdBQUcsK0JBQXlCO1NBQzVDLGFBQWEsR0FBRywrQkFBeUI7U0FDekMsWUFBWSxHQUFHLCtCQUF5QjtTQUN4QyxRQUFRLEdBQThCLGlCQUFXLEdBQUcsQ0FBQyxLQUFLLENBQUM7O1NBRTNELFVBQVUsR0FBRyxZQUFNO0FBQ2pCLFVBQUksQ0FBQyxNQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUN4QixhQUFPLE1BQUssRUFBRSxDQUFDLFNBQVMsR0FBRyxNQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO0tBQzFEOztTQUVELFdBQVcsR0FBRyxVQUFDLEtBQUssRUFBaUI7QUFDbkMsVUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDbEMsY0FBSyxZQUFZLEVBQUUsQ0FBQztPQUNyQixNQUFNO0FBQ0wsY0FBSyxlQUFlLEVBQUUsQ0FBQztPQUN4QjtLQUNGOztTQUVELGVBQWUsR0FBRyxZQUFNO0FBQ3RCLFVBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQUssVUFBVSxFQUFFLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQ3REOztTQUVELFlBQVksR0FBRyxZ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SSxJQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsdUJBQXVCLEtBQUssS0FBSyxFQUVoRCxPQUFPO0FBQ1QsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7QUFDMUMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7QUFDcEMsVUFBTSxZQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUMzQyxVQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7S0FDekQ7OztXQUVpQiw4QkFBRztBQUNuQixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7OztXQUVnQiw2QkFBRztBQUNsQixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7Ozs7O2FBbEljLFlBQU07QUFDbkIsZUFBSyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztPQUN6Qzs7Ozs7NkJBN0VHLG1CQUFtQjtBQUFuQixxQkFBbUIsNEJBQW5CLG1CQUFtQixLQUFuQixtQkFBbUI7U0FBbkIsbUJBQW1CO0dBQVMsbUJBQU0sU0FBUzs7cUJBZ05sQyxtQkFBbUIiLCJmaWxlIjoiL3Jvb3QvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvcmVzdWx0LXZpZXcvcmVzdWx0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSBcImF0b21cIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcbmltcG9ydCB7IGFjdGlvbiwgb2JzZXJ2YWJsZSwgdG9KUyB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgeyBEaXNwbGF5IH0gZnJvbSBcIkBudGVyYWN0L2Rpc3BsYXktYXJlYVwiO1xuaW1wb3J0IHsgdHJhbnNmb3JtcywgZGlzcGxheU9yZGVyIH0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IFN0YXR1cyBmcm9tIFwiLi9zdGF0dXNcIjtcblxuaW1wb3J0IHR5cGUgeyBJT2JzZXJ2YWJsZVZhbHVlIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCB0eXBlIE91dHB1dFN0b3JlIGZyb20gXCIuLy4uLy4uL3N0b3JlL291dHB1dFwiO1xuaW1wb3J0IHR5cGUgS2VybmVsIGZyb20gXCIuLy4uLy4uL2tlcm5lbFwiO1xuXG5jb25zdCBTQ1JPTExfSEVJR0hUID0gNjAwO1xuXG50eXBlIFByb3BzID0ge1xuICBzdG9yZTogT3V0cHV0U3RvcmUsXG4gIGtlcm5lbDogP0tlcm5lbCxcbiAgZGVzdHJveTogRnVuY3Rpb24sXG4gIHNob3dSZXN1bHQ6IGJvb2xlYW5cbn07XG5cbkBvYnNlcnZlclxuY2xhc3MgUmVzdWx0Vmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcz4ge1xuICBlbDogP0hUTUxFbGVtZW50O1xuICBjb250YWluZXJUb29sdGlwID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgYnV0dG9uVG9vbHRpcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIGNsb3NlVG9vbHRpcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIGV4cGFuZGVkOiBJT2JzZXJ2YWJsZVZhbHVlPGJvb2xlYW4+ID0gb2JzZXJ2YWJsZS5ib3goZmFsc2UpO1xuXG4gIGdldEFsbFRleHQgPSAoKSA9PiB7XG4gICAgaWYgKCF0aGlzLmVsKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gdGhpcy5lbC5pbm5lclRleHQgPyB0aGlzLmVsLmlubmVyVGV4dC50cmltKCkgOiBcIlwiO1xuICB9O1xuXG4gIGhhbmRsZUNsaWNrID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkge1xuICAgICAgdGhpcy5vcGVuSW5FZGl0b3IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb3B5VG9DbGlwYm9hcmQoKTtcbiAgICB9XG4gIH07XG5cbiAgY29weVRvQ2xpcGJvYXJkID0gKCkgPT4ge1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRoaXMuZ2V0QWxsVGV4dCgpKTtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIkNvcGllZCB0byBjbGlwYm9hcmRcIik7XG4gIH07XG5cbiAgb3BlbkluRWRpdG9yID0gKCkgPT4ge1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuKGVkaXRvciA9PiBlZGl0b3IuaW5zZXJ0VGV4dCh0aGlzLmdldEFsbFRleHQoKSkpO1xuICB9O1xuXG4gIGFkZENvcHlUb29sdGlwID0gKGVsZW1lbnQ6ID9IVE1MRWxlbWVudCwgY29tcDogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlKSA9PiB7XG4gICAgaWYgKCFlbGVtZW50IHx8ICFjb21wLmRpc3Bvc2FibGVzIHx8IGNvbXAuZGlzcG9zYWJsZXMuc2l6ZSA+IDApIHJldHVybjtcbiAgICBjb21wLmFkZChcbiAgICAgIGF0b20udG9vbHRpcHMuYWRkKGVsZW1lbnQsIHtcbiAgICAgICAgdGl0bGU6IGBDbGljayB0byBjb3B5LFxuICAgICAgICAgICR7XG4gICAgICAgICAgICBwcm9jZXNzLnBsYXRmb3JtID09PSBcImRhcndpblwiID8gXCJDbWRcIiA6IFwiQ3RybFwiXG4gICAgICAgICAgfStDbGljayB0byBvcGVuIGluIGVkaXRvcmBcbiAgICAgIH0pXG4gICAgKTtcbiAgfTtcblxuICBhZGRDbG9zZUJ1dHRvblRvb2x0aXAgPSAoXG4gICAgZWxlbWVudDogP0hUTUxFbGVtZW50LFxuICAgIGNvbXA6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZVxuICApID0+IHtcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWNvbXAuZGlzcG9zYWJsZXMgfHwgY29tcC5kaXNwb3NhYmxlcy5zaXplID4gMCkgcmV0dXJuO1xuICAgIGNvbXAuYWRkKFxuICAgICAgYXRvbS50b29sdGlwcy5hZGQoZWxlbWVudCwge1xuICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5zdG9yZS5leGVjdXRpb25Db3VudFxuICAgICAgICAgID8gYENsb3NlIChPdXRbJHt0aGlzLnByb3BzLnN0b3JlLmV4ZWN1dGlvbkNvdW50fV0pYFxuICAgICAgICAgIDogXCJDbG9zZSByZXN1bHRcIlxuICAgICAgfSlcbiAgICApO1xuICB9O1xuXG4gIGFkZENvcHlCdXR0b25Ub29sdGlwID0gKGVsZW1lbnQ6ID9IVE1MRWxlbWVudCkgPT4ge1xuICAgIHRoaXMuYWRkQ29weVRvb2x0aXAoZWxlbWVudCwgdGhpcy5idXR0b25Ub29sdGlwKTtcbiAgfTtcblxuICBvbldoZWVsID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgcmV0dXJuIChldmVudDogV2hlZWxFdmVudCkgPT4ge1xuICAgICAgY29uc3QgY2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICBjb25zdCBzY3JvbGxIZWlnaHQgPSBlbGVtZW50LnNjcm9sbEhlaWdodDtcbiAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IGVsZW1lbnQuc2Nyb2xsVG9wO1xuICAgICAgY29uc3QgYXRUb3AgPSBzY3JvbGxUb3AgIT09IDAgJiYgZXZlbnQuZGVsdGFZIDwgMDtcbiAgICAgIGNvbnN0IGF0Qm90dG9tID1cbiAgICAgICAgc2Nyb2xsVG9wICE9PSBzY3JvbGxIZWlnaHQgLSBjbGllbnRIZWlnaHQgJiYgZXZlbnQuZGVsdGFZID4gMDtcblxuICAgICAgaWYgKGNsaWVudEhlaWdodCA8IHNjcm9sbEhlaWdodCAmJiAoYXRUb3AgfHwgYXRCb3R0b20pKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgQGFjdGlvblxuICB0b2dnbGVFeHBhbmQgPSAoKSA9PiB7XG4gICAgdGhpcy5leHBhbmRlZC5zZXQoIXRoaXMuZXhwYW5kZWQuZ2V0KCkpO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IG91dHB1dHMsIHN0YXR1cywgaXNQbGFpbiwgcG9zaXRpb24gfSA9IHRoaXMucHJvcHMuc3RvcmU7XG5cbiAgICBjb25zdCBpbmxpbmVTdHlsZSA9IHtcbiAgICAgIG1hcmdpbkxlZnQ6IGAke3Bvc2l0aW9uLmxpbmVMZW5ndGggKyBwb3NpdGlvbi5jaGFyV2lkdGh9cHhgLFxuICAgICAgbWFyZ2luVG9wOiBgLSR7cG9zaXRpb24ubGluZUhlaWdodH1weGBcbiAgICB9O1xuXG4gICAgaWYgKG91dHB1dHMubGVuZ3RoID09PSAwIHx8IHRoaXMucHJvcHMuc2hvd1Jlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMucHJvcHMua2VybmVsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFN0YXR1c1xuICAgICAgICAgIHN0YXR1cz17XG4gICAgICAgICAgICBrZXJuZWwgJiYga2VybmVsLmV4ZWN1dGlvblN0YXRlICE9PSBcImJ1c3lcIiAmJiBzdGF0dXMgPT09IFwicnVubmluZ1wiXG4gICAgICAgICAgICAgID8gXCJlcnJvclwiXG4gICAgICAgICAgICAgIDogc3RhdHVzXG4gICAgICAgICAgfVxuICAgICAgICAgIHN0eWxlPXtpbmxpbmVTdHlsZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtpc1BsYWluID8gXCJpbmxpbmUtY29udGFpbmVyXCIgOiBcIm11bHRpbGluZS1jb250YWluZXJcIn1cbiAgICAgICAgb25DbGljaz17aXNQbGFpbiA/IHRoaXMuaGFuZGxlQ2xpY2sgOiB1bmRlZmluZWR9XG4gICAgICAgIHN0eWxlPXtcbiAgICAgICAgICBpc1BsYWluXG4gICAgICAgICAgICA/IGlubGluZVN0eWxlXG4gICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICBtYXhXaWR0aDogYCR7cG9zaXRpb24uZWRpdG9yV2lkdGggLSAyICogcG9zaXRpb24uY2hhcldpZHRofXB4YCxcbiAgICAgICAgICAgICAgICBtYXJnaW46IFwiMHB4XCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJoeWRyb2dlbl9jZWxsX2Rpc3BsYXlcIlxuICAgICAgICAgIHJlZj17cmVmID0+IHtcbiAgICAgICAgICAgIGlmICghcmVmKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmVsID0gcmVmO1xuXG4gICAgICAgICAgICBpc1BsYWluXG4gICAgICAgICAgICAgID8gdGhpcy5hZGRDb3B5VG9vbHRpcChyZWYsIHRoaXMuY29udGFpbmVyVG9vbHRpcClcbiAgICAgICAgICAgICAgOiB0aGlzLmNvbnRhaW5lclRvb2x0aXAuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAvLyBBcyBvZiB0aGlzIHdyaXRpbmcgUmVhY3QncyBldmVudCBoYW5kbGVyIGRvZXNuJ3QgcHJvcGVybHkgaGFuZGxlXG4gICAgICAgICAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKSBmb3IgZXZlbnRzIG91dHNpZGUgdGhlIFJlYWN0IGNvbnRleHQuXG4gICAgICAgICAgICBpZiAoIXRoaXMuZXhwYW5kZWQuZ2V0KCkgJiYgIWlzUGxhaW4gJiYgcmVmKSB7XG4gICAgICAgICAgICAgIHJlZi5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgdGhpcy5vbldoZWVsKHJlZiksIHtcbiAgICAgICAgICAgICAgICBwYXNzaXZlOiB0cnVlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIG1heEhlaWdodDogdGhpcy5leHBhbmRlZC5nZXQoKSA/IFwiMTAwJVwiIDogYCR7U0NST0xMX0hFSUdIVH1weGAsXG4gICAgICAgICAgICBvdmVyZmxvd1k6IFwiYXV0b1wiXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxEaXNwbGF5XG4gICAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgICBvdXRwdXRzPXt0b0pTKG91dHB1dHMpfVxuICAgICAgICAgICAgZGlzcGxheU9yZGVyPXtkaXNwbGF5T3JkZXJ9XG4gICAgICAgICAgICB0cmFuc2Zvcm1zPXt0cmFuc2Zvcm1zfVxuICAgICAgICAgICAgdGhlbWU9XCJsaWdodFwiXG4gICAgICAgICAgICBtb2RlbHM9e3t9fVxuICAgICAgICAgICAgZXhwYW5kZWRcbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2lzUGxhaW4gPyBudWxsIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9vbGJhclwiPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpY29uIGljb24teFwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMuZGVzdHJveX1cbiAgICAgICAgICAgICAgcmVmPXtyZWYgPT4gdGhpcy5hZGRDbG9zZUJ1dHRvblRvb2x0aXAocmVmLCB0aGlzLmNsb3NlVG9vbHRpcCl9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZsZXg6IDEsIG1pbkhlaWdodDogXCIwLjI1ZW1cIiB9fSAvPlxuXG4gICAgICAgICAgICB7dGhpcy5nZXRBbGxUZXh0KCkubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImljb24gaWNvbi1jbGlwcHlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLmFkZENvcHlCdXR0b25Ub29sdGlwfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICAgIHt0aGlzLmVsICYmIHRoaXMuZWwuc2Nyb2xsSGVpZ2h0ID4gU0NST0xMX0hFSUdIVCA/IChcbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGljb24gaWNvbi0ke1xuICAgICAgICAgICAgICAgICAgdGhpcy5leHBhbmRlZC5nZXQoKSA/IFwiZm9sZFwiIDogXCJ1bmZvbGRcIlxuICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlRXhwYW5kfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20oKSB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuZWwgfHxcbiAgICAgIHRoaXMuZXhwYW5kZWQgPT09IHRydWUgfHxcbiAgICAgIHRoaXMucHJvcHMuc3RvcmUuaXNQbGFpbiA9PT0gdHJ1ZSB8fFxuICAgICAgYXRvbS5jb25maWcuZ2V0KGBIeWRyb2dlbi5hdXRvU2Nyb2xsYCkgPT09IGZhbHNlXG4gICAgKVxuICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IHNjcm9sbEhlaWdodCA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0O1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZWwuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9IHNjcm9sbEhlaWdodCAtIGhlaWdodDtcbiAgICB0aGlzLmVsLnNjcm9sbFRvcCA9IG1heFNjcm9sbFRvcCA+IDAgPyBtYXhTY3JvbGxUb3AgOiAwO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuY29udGFpbmVyVG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgdGhpcy5idXR0b25Ub29sdGlwLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmNsb3NlVG9vbHRpcC5kaXNwb3NlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVzdWx0Vmlld0NvbXBvbmVudDtcbiJdfQ==