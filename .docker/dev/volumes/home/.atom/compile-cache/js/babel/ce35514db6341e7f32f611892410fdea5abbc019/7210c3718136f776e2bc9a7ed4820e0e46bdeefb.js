Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _mobx = require("mobx");

var _utils = require("./utils");

var KernelTransport = (function () {
  var _instanceInitializers = {};
  var _instanceInitializers = {};

  _createDecoratedClass(KernelTransport, [{
    key: "executionState",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return "loading";
    },
    enumerable: true
  }, {
    key: "inspector",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return { bundle: {} };
    },
    enumerable: true
  }], null, _instanceInitializers);

  function KernelTransport(kernelSpec, grammar) {
    _classCallCheck(this, KernelTransport);

    _defineDecoratedPropertyDescriptor(this, "executionState", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "inspector", _instanceInitializers);

    this.kernelSpec = kernelSpec;
    this.grammar = grammar;

    this.language = kernelSpec.language.toLowerCase();
    this.displayName = kernelSpec.display_name;
  }

  _createDecoratedClass(KernelTransport, [{
    key: "setExecutionState",
    decorators: [_mobx.action],
    value: function setExecutionState(state) {
      this.executionState = state;
    }
  }, {
    key: "interrupt",
    value: function interrupt() {
      throw new Error("KernelTransport: interrupt method not implemented");
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      throw new Error("KernelTransport: shutdown method not implemented");
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      throw new Error("KernelTransport: restart method not implemented");
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      throw new Error("KernelTransport: execute method not implemented");
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      throw new Error("KernelTransport: complete method not implemented");
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      throw new Error("KernelTransport: inspect method not implemented");
    }
  }, {
    key: "inputReply",
    value: function inputReply(input) {
      throw new Error("KernelTransport: inputReply method not implemented");
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("KernelTransport: Destroying base kernel");
    }
  }], null, _instanceInitializers);

  return KernelTransport;
})();

exports["default"] = KernelTransport;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtdHJhbnNwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRW1DLE1BQU07O3FCQUVyQixTQUFTOztJQU9SLGVBQWU7Ozs7d0JBQWYsZUFBZTs7OzthQUNMLFNBQVM7Ozs7Ozs7YUFDZCxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7Ozs7O0FBTzNCLFdBVFEsZUFBZSxDQVN0QixVQUFzQixFQUFFLE9BQXFCLEVBQUU7MEJBVHhDLGVBQWU7Ozs7OztBQVVoQyxRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM3QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7QUFFdkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xELFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQztHQUM1Qzs7d0JBZmtCLGVBQWU7OztXQWtCakIsMkJBQUMsS0FBYSxFQUFFO0FBQy9CLFVBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0tBQzdCOzs7V0FFUSxxQkFBRztBQUNWLFlBQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztLQUN0RTs7O1dBRU8sb0JBQUc7QUFDVCxZQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7S0FDckU7OztXQUVNLGlCQUFDLFdBQXNCLEVBQUU7QUFDOUIsWUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0tBQ3BFOzs7V0FFTSxpQkFBQyxJQUFZLEVBQUUsU0FBMEIsRUFBRTtBQUNoRCxZQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7S0FDcEU7OztXQUVPLGtCQUFDLElBQVksRUFBRSxTQUEwQixFQUFFO0FBQ2pELFlBQU0sSUFBSSxLQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQztLQUNyRTs7O1dBRU0saUJBQUMsSUFBWSxFQUFFLFNBQWlCLEVBQUUsU0FBMEIsRUFBRTtBQUNuRSxZQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7S0FDcEU7OztXQUVTLG9CQUFDLEtBQWEsRUFBRTtBQUN4QixZQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7S0FDdkU7OztXQUVNLG1CQUFHO0FBQ1Isc0JBQUkseUNBQXlDLENBQUMsQ0FBQztLQUNoRDs7O1NBcERrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiIvcm9vdC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIva2VybmVsLXRyYW5zcG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IG9ic2VydmFibGUsIGFjdGlvbiB9IGZyb20gXCJtb2J4XCI7XG5cbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCB0eXBlIFJlc3VsdHNDYWxsYmFjayA9IChcbiAgbWVzc2FnZTogYW55LFxuICBjaGFubmVsOiBcInNoZWxsXCIgfCBcImlvcHViXCIgfCBcInN0ZGluXCJcbikgPT4gdm9pZDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2VybmVsVHJhbnNwb3J0IHtcbiAgQG9ic2VydmFibGUgZXhlY3V0aW9uU3RhdGUgPSBcImxvYWRpbmdcIjtcbiAgQG9ic2VydmFibGUgaW5zcGVjdG9yID0geyBidW5kbGU6IHt9IH07XG5cbiAga2VybmVsU3BlYzogS2VybmVsc3BlYztcbiAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyO1xuICBsYW5ndWFnZTogc3RyaW5nO1xuICBkaXNwbGF5TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsIGdyYW1tYXI6IGF0b20kR3JhbW1hcikge1xuICAgIHRoaXMua2VybmVsU3BlYyA9IGtlcm5lbFNwZWM7XG4gICAgdGhpcy5ncmFtbWFyID0gZ3JhbW1hcjtcblxuICAgIHRoaXMubGFuZ3VhZ2UgPSBrZXJuZWxTcGVjLmxhbmd1YWdlLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5kaXNwbGF5TmFtZSA9IGtlcm5lbFNwZWMuZGlzcGxheV9uYW1lO1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRFeGVjdXRpb25TdGF0ZShzdGF0ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5leGVjdXRpb25TdGF0ZSA9IHN0YXRlO1xuICB9XG5cbiAgaW50ZXJydXB0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIktlcm5lbFRyYW5zcG9ydDogaW50ZXJydXB0IG1ldGhvZCBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICBzaHV0ZG93bigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXJuZWxUcmFuc3BvcnQ6IHNodXRkb3duIG1ldGhvZCBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICByZXN0YXJ0KG9uUmVzdGFydGVkOiA/RnVuY3Rpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXJuZWxUcmFuc3BvcnQ6IHJlc3RhcnQgbWV0aG9kIG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgfVxuXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjaykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIktlcm5lbFRyYW5zcG9ydDogZXhlY3V0ZSBtZXRob2Qgbm90IGltcGxlbWVudGVkXCIpO1xuICB9XG5cbiAgY29tcGxldGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjaykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIktlcm5lbFRyYW5zcG9ydDogY29tcGxldGUgbWV0aG9kIG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgfVxuXG4gIGluc3BlY3QoY29kZTogc3RyaW5nLCBjdXJzb3JQb3M6IG51bWJlciwgb25SZXN1bHRzOiBSZXN1bHRzQ2FsbGJhY2spIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXJuZWxUcmFuc3BvcnQ6IGluc3BlY3QgbWV0aG9kIG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgfVxuXG4gIGlucHV0UmVwbHkoaW5wdXQ6IHN0cmluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIktlcm5lbFRyYW5zcG9ydDogaW5wdXRSZXBseSBtZXRob2Qgbm90IGltcGxlbWVudGVkXCIpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJLZXJuZWxUcmFuc3BvcnQ6IERlc3Ryb3lpbmcgYmFzZSBrZXJuZWxcIik7XG4gIH1cbn1cbiJdfQ==