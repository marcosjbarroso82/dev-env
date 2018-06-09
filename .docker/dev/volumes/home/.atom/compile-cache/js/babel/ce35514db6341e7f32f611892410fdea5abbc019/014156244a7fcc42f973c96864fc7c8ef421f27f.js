Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var StatusBar = (0, _mobxReact.observer)(function (_ref) {
  var _ref$store = _ref.store;
  var kernel = _ref$store.kernel;
  var configMapping = _ref$store.configMapping;
  var onClick = _ref.onClick;

  if (!kernel || configMapping.get("Hydrogen.statusBarDisable")) return null;
  return _react2["default"].createElement(
    "a",
    { onClick: onClick },
    kernel.displayName,
    " | ",
    kernel.executionState
  );
});

exports["default"] = StatusBar;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3N0YXR1cy1iYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3FCQUVrQixPQUFPOzs7O3lCQUNBLFlBQVk7O0FBVXJDLElBQU0sU0FBUyxHQUFHLHlCQUNoQixVQUFDLElBQTZDLEVBQVk7bUJBQXpELElBQTZDLENBQTNDLEtBQUs7TUFBSSxNQUFNLGNBQU4sTUFBTTtNQUFFLGFBQWEsY0FBYixhQUFhO01BQUksT0FBTyxHQUEzQyxJQUE2QyxDQUFULE9BQU87O0FBQzFDLE1BQUksQ0FBQyxNQUFNLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQzNFLFNBQ0U7O01BQUcsT0FBTyxFQUFFLE9BQU8sQUFBQztJQUNqQixNQUFNLENBQUMsV0FBVzs7SUFBSyxNQUFNLENBQUMsY0FBYztHQUMzQyxDQUNKO0NBQ0gsQ0FDRixDQUFDOztxQkFFYSxTQUFTIiwiZmlsZSI6Ii9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3N0YXR1cy1iYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5cbmltcG9ydCB0eXBlIEtlcm5lbCBmcm9tIFwiLi8uLi9rZXJuZWxcIjtcbmltcG9ydCB0eXBlb2Ygc3RvcmUgZnJvbSBcIi4vLi4vc3RvcmVcIjtcblxudHlwZSBQcm9wcyA9IHtcbiAgc3RvcmU6IHsga2VybmVsOiA/S2VybmVsLCBjb25maWdNYXBwaW5nOiBNYXA8c3RyaW5nLCBtaXhlZD4gfSxcbiAgb25DbGljazogRnVuY3Rpb25cbn07XG5cbmNvbnN0IFN0YXR1c0JhciA9IG9ic2VydmVyKFxuICAoeyBzdG9yZTogeyBrZXJuZWwsIGNvbmZpZ01hcHBpbmcgfSwgb25DbGljayB9OiBQcm9wcykgPT4ge1xuICAgIGlmICgha2VybmVsIHx8IGNvbmZpZ01hcHBpbmcuZ2V0KFwiSHlkcm9nZW4uc3RhdHVzQmFyRGlzYWJsZVwiKSkgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChcbiAgICAgIDxhIG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAgICB7a2VybmVsLmRpc3BsYXlOYW1lfSB8IHtrZXJuZWwuZXhlY3V0aW9uU3RhdGV9XG4gICAgICA8L2E+XG4gICAgKTtcbiAgfVxuKTtcblxuZXhwb3J0IGRlZmF1bHQgU3RhdHVzQmFyO1xuIl19