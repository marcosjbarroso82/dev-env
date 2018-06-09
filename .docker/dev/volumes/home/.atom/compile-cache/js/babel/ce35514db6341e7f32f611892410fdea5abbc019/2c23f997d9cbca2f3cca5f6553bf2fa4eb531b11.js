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

var _mobx = require("mobx");

var _mobxReact = require("mobx-react");

var _anser = require("anser");

var _anser2 = _interopRequireDefault(_anser);

var _resultViewHistory = require("./result-view/history");

var _resultViewHistory2 = _interopRequireDefault(_resultViewHistory);

var _resultViewList = require("./result-view/list");

var _resultViewList2 = _interopRequireDefault(_resultViewList);

var _utils = require("./../utils");

var OutputArea = (function (_React$Component) {
  var _instanceInitializers = {};

  _inherits(OutputArea, _React$Component);

  function OutputArea() {
    var _this = this;

    _classCallCheck(this, _OutputArea);

    _get(Object.getPrototypeOf(_OutputArea.prototype), "constructor", this).apply(this, arguments);

    this.showHistory = _mobx.observable.box(true);

    _defineDecoratedPropertyDescriptor(this, "setHistory", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setScrollList", _instanceInitializers);

    this.handleClick = function () {
      var kernel = _this.props.store.kernel;
      if (!kernel || !kernel.outputStore) return;
      var output = kernel.outputStore.outputs[kernel.outputStore.index];
      var copyOutput = _this.getOutputText(output);

      if (copyOutput) {
        atom.clipboard.write(_anser2["default"].ansiToText(copyOutput));
        atom.notifications.addSuccess("Copied to clipboard");
      } else {
        atom.notifications.addWarning("Nothing to copy");
      }
    };
  }

  _createDecoratedClass(OutputArea, [{
    key: "getOutputText",
    value: function getOutputText(output) {
      switch (output.output_type) {
        case "stream":
          return output.text;
        case "execute_result":
          return output.data["text/plain"];
        case "error":
          return output.traceback.toJS().join("\n");
      }
    }
  }, {
    key: "render",
    value: function render() {
      var kernel = this.props.store.kernel;

      if (!kernel) {
        if (atom.config.get("Hydrogen.outputAreaDock")) {
          return _react2["default"].createElement(_utils.EmptyMessage, null);
        } else {
          atom.workspace.hide(_utils.OUTPUT_AREA_URI);
          return null;
        }
      }
      return _react2["default"].createElement(
        "div",
        { className: "sidebar output-area" },
        kernel.outputStore.outputs.length > 0 ? _react2["default"].createElement(
          "div",
          { className: "block" },
          _react2["default"].createElement(
            "div",
            { className: "btn-group" },
            _react2["default"].createElement("button", {
              className: "btn icon icon-clock" + (this.showHistory.get() ? " selected" : ""),
              onClick: this.setHistory
            }),
            _react2["default"].createElement("button", {
              className: "btn icon icon-three-bars" + (!this.showHistory.get() ? " selected" : ""),
              onClick: this.setScrollList
            })
          ),
          _react2["default"].createElement(
            "div",
            { style: { float: "right" } },
            this.showHistory.get() ? _react2["default"].createElement(
              "button",
              {
                className: "btn icon icon-clippy",
                onClick: this.handleClick
              },
              "Copy"
            ) : null,
            _react2["default"].createElement(
              "button",
              {
                className: "btn icon icon-trashcan",
                onClick: kernel.outputStore.clear
              },
              "Clear"
            )
          )
        ) : _react2["default"].createElement(_utils.EmptyMessage, null),
        this.showHistory.get() ? _react2["default"].createElement(_resultViewHistory2["default"], { store: kernel.outputStore }) : _react2["default"].createElement(_resultViewList2["default"], { outputs: kernel.outputStore.outputs })
      );
    }
  }, {
    key: "setHistory",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        _this2.showHistory.set(true);
      };
    },
    enumerable: true
  }, {
    key: "setScrollList",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.showHistory.set(false);
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  var _OutputArea = OutputArea;
  OutputArea = (0, _mobxReact.observer)(OutputArea) || OutputArea;
  return OutputArea;
})(_react2["default"].Component);

exports["default"] = OutputArea;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL291dHB1dC1hcmVhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O3FCQUN4QixPQUFPOzs7O29CQUNVLE1BQU07O3lCQUNoQixZQUFZOztxQkFDbkIsT0FBTzs7OztpQ0FFTCx1QkFBdUI7Ozs7OEJBQ3BCLG9CQUFvQjs7OztxQkFDRyxZQUFZOztJQU1wRCxVQUFVOzs7WUFBVixVQUFVOztXQUFWLFVBQVU7Ozs7Ozs7U0FDZCxXQUFXLEdBQThCLGlCQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUM7Ozs7OztTQXNCN0QsV0FBVyxHQUFHLFlBQU07QUFDbEIsVUFBTSxNQUFNLEdBQUcsTUFBSyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUN2QyxVQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPO0FBQzNDLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEUsVUFBTSxVQUFVLEdBQUcsTUFBSyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTlDLFVBQUksVUFBVSxFQUFFO0FBQ2QsWUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsbUJBQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDbkQsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztPQUN0RCxNQUFNO0FBQ0wsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztPQUNsRDtLQUNGOzs7d0JBbkNHLFVBQVU7O1dBWUQsdUJBQUMsTUFBYyxFQUFXO0FBQ3JDLGNBQVEsTUFBTSxDQUFDLFdBQVc7QUFDeEIsYUFBSyxRQUFRO0FBQ1gsaUJBQU8sTUFBTSxDQUFDLElBQUksQ0FBQztBQUFBLEFBQ3JCLGFBQUssZ0JBQWdCO0FBQ25CLGlCQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFBQSxBQUNuQyxhQUFLLE9BQU87QUFDVixpQkFBTyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUFBLE9BQzdDO0tBQ0Y7OztXQWdCSyxrQkFBRztBQUNQLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFdkMsVUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFlBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsRUFBRTtBQUM5QyxpQkFBTywyREFBZ0IsQ0FBQztTQUN6QixNQUFNO0FBQ0wsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFpQixDQUFDO0FBQ3JDLGlCQUFPLElBQUksQ0FBQztTQUNiO09BQ0Y7QUFDRCxhQUNFOztVQUFLLFNBQVMsRUFBQyxxQkFBcUI7UUFDakMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsR0FDcEM7O1lBQUssU0FBUyxFQUFDLE9BQU87VUFDcEI7O2NBQUssU0FBUyxFQUFDLFdBQVc7WUFDeEI7QUFDRSx1QkFBUywyQkFDUCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVcsR0FBRyxFQUFFLENBQUEsQUFDeEM7QUFDSCxxQkFBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEFBQUM7Y0FDekI7WUFDRjtBQUNFLHVCQUFTLGdDQUNQLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxXQUFXLEdBQUcsRUFBRSxDQUFBLEFBQ3pDO0FBQ0gscUJBQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxBQUFDO2NBQzVCO1dBQ0U7VUFDTjs7Y0FBSyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEFBQUM7WUFDNUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FDckI7OztBQUNFLHlCQUFTLEVBQUMsc0JBQXNCO0FBQ2hDLHVCQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQUFBQzs7O2FBR25CLEdBQ1AsSUFBSTtZQUNSOzs7QUFDRSx5QkFBUyxFQUFDLHdCQUF3QjtBQUNsQyx1QkFBTyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxBQUFDOzs7YUFHM0I7V0FDTDtTQUNGLEdBRU4sMkRBQWdCLEFBQ2pCO1FBQ0EsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FDckIsbUVBQVMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEFBQUMsR0FBRyxHQUV0QyxnRUFBWSxPQUFPLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEFBQUMsR0FBRyxBQUNwRDtPQUNHLENBQ047S0FDSDs7Ozs7OzthQTFGWSxZQUFNO0FBQ2pCLGVBQUssV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM1Qjs7Ozs7Ozs7O2FBR2UsWUFBTTtBQUNwQixlQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDN0I7Ozs7O29CQVZHLFVBQVU7QUFBVixZQUFVLDRCQUFWLFVBQVUsS0FBVixVQUFVO1NBQVYsVUFBVTtHQUFTLG1CQUFNLFNBQVM7O3FCQWdHekIsVUFBVSIsImZpbGUiOiIvcm9vdC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvY29tcG9uZW50cy9vdXRwdXQtYXJlYS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgYWN0aW9uLCBvYnNlcnZhYmxlIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcbmltcG9ydCBBbnNlciBmcm9tIFwiYW5zZXJcIjtcblxuaW1wb3J0IEhpc3RvcnkgZnJvbSBcIi4vcmVzdWx0LXZpZXcvaGlzdG9yeVwiO1xuaW1wb3J0IFNjcm9sbExpc3QgZnJvbSBcIi4vcmVzdWx0LXZpZXcvbGlzdFwiO1xuaW1wb3J0IHsgT1VUUFVUX0FSRUFfVVJJLCBFbXB0eU1lc3NhZ2UgfSBmcm9tIFwiLi8uLi91dGlsc1wiO1xuXG5pbXBvcnQgdHlwZW9mIHN0b3JlIGZyb20gXCIuLi9zdG9yZVwiO1xuaW1wb3J0IHR5cGUgeyBJT2JzZXJ2YWJsZVZhbHVlIH0gZnJvbSBcIm1vYnhcIjtcblxuQG9ic2VydmVyXG5jbGFzcyBPdXRwdXRBcmVhIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHsgc3RvcmU6IHN0b3JlIH0+IHtcbiAgc2hvd0hpc3Rvcnk6IElPYnNlcnZhYmxlVmFsdWU8Ym9vbGVhbj4gPSBvYnNlcnZhYmxlLmJveCh0cnVlKTtcbiAgQGFjdGlvblxuICBzZXRIaXN0b3J5ID0gKCkgPT4ge1xuICAgIHRoaXMuc2hvd0hpc3Rvcnkuc2V0KHRydWUpO1xuICB9O1xuXG4gIEBhY3Rpb25cbiAgc2V0U2Nyb2xsTGlzdCA9ICgpID0+IHtcbiAgICB0aGlzLnNob3dIaXN0b3J5LnNldChmYWxzZSk7XG4gIH07XG5cbiAgZ2V0T3V0cHV0VGV4dChvdXRwdXQ6IE9iamVjdCk6ID9zdHJpbmcge1xuICAgIHN3aXRjaCAob3V0cHV0Lm91dHB1dF90eXBlKSB7XG4gICAgICBjYXNlIFwic3RyZWFtXCI6XG4gICAgICAgIHJldHVybiBvdXRwdXQudGV4dDtcbiAgICAgIGNhc2UgXCJleGVjdXRlX3Jlc3VsdFwiOlxuICAgICAgICByZXR1cm4gb3V0cHV0LmRhdGFbXCJ0ZXh0L3BsYWluXCJdO1xuICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgIHJldHVybiBvdXRwdXQudHJhY2ViYWNrLnRvSlMoKS5qb2luKFwiXFxuXCIpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMucHJvcHMuc3RvcmUua2VybmVsO1xuICAgIGlmICgha2VybmVsIHx8ICFrZXJuZWwub3V0cHV0U3RvcmUpIHJldHVybjtcbiAgICBjb25zdCBvdXRwdXQgPSBrZXJuZWwub3V0cHV0U3RvcmUub3V0cHV0c1trZXJuZWwub3V0cHV0U3RvcmUuaW5kZXhdO1xuICAgIGNvbnN0IGNvcHlPdXRwdXQgPSB0aGlzLmdldE91dHB1dFRleHQob3V0cHV0KTtcblxuICAgIGlmIChjb3B5T3V0cHV0KSB7XG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShBbnNlci5hbnNpVG9UZXh0KGNvcHlPdXRwdXQpKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiQ29waWVkIHRvIGNsaXBib2FyZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJOb3RoaW5nIHRvIGNvcHlcIik7XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBrZXJuZWwgPSB0aGlzLnByb3BzLnN0b3JlLmtlcm5lbDtcblxuICAgIGlmICgha2VybmVsKSB7XG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4ub3V0cHV0QXJlYURvY2tcIikpIHtcbiAgICAgICAgcmV0dXJuIDxFbXB0eU1lc3NhZ2UgLz47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5oaWRlKE9VVFBVVF9BUkVBX1VSSSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzaWRlYmFyIG91dHB1dC1hcmVhXCI+XG4gICAgICAgIHtrZXJuZWwub3V0cHV0U3RvcmUub3V0cHV0cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2tcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BidG4gaWNvbiBpY29uLWNsb2NrJHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0hpc3RvcnkuZ2V0KCkgPyBcIiBzZWxlY3RlZFwiIDogXCJcIlxuICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc2V0SGlzdG9yeX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGJ0biBpY29uIGljb24tdGhyZWUtYmFycyR7XG4gICAgICAgICAgICAgICAgICAhdGhpcy5zaG93SGlzdG9yeS5nZXQoKSA/IFwiIHNlbGVjdGVkXCIgOiBcIlwiXG4gICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5zZXRTY3JvbGxMaXN0fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZsb2F0OiBcInJpZ2h0XCIgfX0+XG4gICAgICAgICAgICAgIHt0aGlzLnNob3dIaXN0b3J5LmdldCgpID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tY2xpcHB5XCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgQ29weVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tdHJhc2hjYW5cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2tlcm5lbC5vdXRwdXRTdG9yZS5jbGVhcn1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPEVtcHR5TWVzc2FnZSAvPlxuICAgICAgICApfVxuICAgICAgICB7dGhpcy5zaG93SGlzdG9yeS5nZXQoKSA/IChcbiAgICAgICAgICA8SGlzdG9yeSBzdG9yZT17a2VybmVsLm91dHB1dFN0b3JlfSAvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxTY3JvbGxMaXN0IG91dHB1dHM9e2tlcm5lbC5vdXRwdXRTdG9yZS5vdXRwdXRzfSAvPlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPdXRwdXRBcmVhO1xuIl19