Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _nteractTransforms = require("@nteract/transforms");

var _nteractTransformPlotly = require("@nteract/transform-plotly");

var _nteractTransformPlotly2 = _interopRequireDefault(_nteractTransformPlotly);

var _nteractTransformVega = require("@nteract/transform-vega");

// We can easily add other transforms here:
var additionalTransforms = [_nteractTransformPlotly2["default"], _nteractTransformVega.VegaLite1, _nteractTransformVega.VegaLite2, _nteractTransformVega.Vega2, _nteractTransformVega.Vega3];

var _additionalTransforms$reduce = additionalTransforms.reduce(_nteractTransforms.registerTransform, {
  transforms: _nteractTransforms.standardTransforms,
  displayOrder: _nteractTransforms.standardDisplayOrder
});

var transforms = _additionalTransforms$reduce.transforms;
var displayOrder = _additionalTransforms$reduce.displayOrder;
exports.transforms = transforms;
exports.displayOrder = displayOrder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3RyYW5zZm9ybXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2lDQU1PLHFCQUFxQjs7c0NBQ0EsMkJBQTJCOzs7O29DQUNKLHlCQUF5Qjs7O0FBRzVFLElBQU0sb0JBQWdDLEdBQUcsaUtBTXhDLENBQUM7O21DQUUwQyxvQkFBb0IsQ0FBQyxNQUFNLHVDQUVyRTtBQUNFLFlBQVUsdUNBQW9CO0FBQzlCLGNBQVkseUNBQXNCO0NBQ25DLENBQ0Y7O0lBTmMsVUFBVSxnQ0FBVixVQUFVO0lBQUUsWUFBWSxnQ0FBWixZQUFZIiwiZmlsZSI6Ii9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3RyYW5zZm9ybXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQge1xuICBzdGFuZGFyZFRyYW5zZm9ybXMsXG4gIHN0YW5kYXJkRGlzcGxheU9yZGVyLFxuICByZWdpc3RlclRyYW5zZm9ybVxufSBmcm9tIFwiQG50ZXJhY3QvdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IFBsb3RseVRyYW5zZm9ybSBmcm9tIFwiQG50ZXJhY3QvdHJhbnNmb3JtLXBsb3RseVwiO1xuaW1wb3J0IHsgVmVnYUxpdGUxLCBWZWdhTGl0ZTIsIFZlZ2EyLCBWZWdhMyB9IGZyb20gXCJAbnRlcmFjdC90cmFuc2Zvcm0tdmVnYVwiO1xuXG4vLyBXZSBjYW4gZWFzaWx5IGFkZCBvdGhlciB0cmFuc2Zvcm1zIGhlcmU6XG5jb25zdCBhZGRpdGlvbmFsVHJhbnNmb3JtczogQXJyYXk8YW55PiA9IFtcbiAgUGxvdGx5VHJhbnNmb3JtLFxuICBWZWdhTGl0ZTEsXG4gIFZlZ2FMaXRlMixcbiAgVmVnYTIsXG4gIFZlZ2EzXG5dO1xuXG5leHBvcnQgY29uc3QgeyB0cmFuc2Zvcm1zLCBkaXNwbGF5T3JkZXIgfSA9IGFkZGl0aW9uYWxUcmFuc2Zvcm1zLnJlZHVjZShcbiAgcmVnaXN0ZXJUcmFuc2Zvcm0sXG4gIHtcbiAgICB0cmFuc2Zvcm1zOiBzdGFuZGFyZFRyYW5zZm9ybXMsXG4gICAgZGlzcGxheU9yZGVyOiBzdGFuZGFyZERpc3BsYXlPcmRlclxuICB9XG4pO1xuIl19