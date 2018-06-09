Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atom = require("atom");

var _mobx = require("mobx");

var _lodash = require("lodash");

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _storeWatches = require("./store/watches");

var _storeWatches2 = _interopRequireDefault(_storeWatches);

var _storeOutput = require("./store/output");

var _storeOutput2 = _interopRequireDefault(_storeOutput);

var _pluginApiHydrogenKernel = require("./plugin-api/hydrogen-kernel");

var _pluginApiHydrogenKernel2 = _interopRequireDefault(_pluginApiHydrogenKernel);

var _inputView = require("./input-view");

var _inputView2 = _interopRequireDefault(_inputView);

var _kernelTransport = require("./kernel-transport");

var _kernelTransport2 = _interopRequireDefault(_kernelTransport);

function protectFromInvalidMessages(onResults) {
  var wrappedOnResults = function wrappedOnResults(message, channel) {
    if (!message) {
      (0, _utils.log)("Invalid message: null");
      return;
    }

    if (!message.content) {
      (0, _utils.log)("Invalid message: Missing content");
      return;
    }

    if (message.content.execution_state === "starting") {
      // Kernels send a starting status message with an empty parent_header
      (0, _utils.log)("Dropped starting status IO message");
      return;
    }

    if (!message.parent_header) {
      (0, _utils.log)("Invalid message: Missing parent_header");
      return;
    }

    if (!message.parent_header.msg_id) {
      (0, _utils.log)("Invalid message: Missing parent_header.msg_id");
      return;
    }

    if (!message.parent_header.msg_type) {
      (0, _utils.log)("Invalid message: Missing parent_header.msg_type");
      return;
    }

    if (!message.header) {
      (0, _utils.log)("Invalid message: Missing header");
      return;
    }

    if (!message.header.msg_id) {
      (0, _utils.log)("Invalid message: Missing header.msg_id");
      return;
    }

    if (!message.header.msg_type) {
      (0, _utils.log)("Invalid message: Missing header.msg_type");
      return;
    }

    onResults(message, channel);
  };
  return wrappedOnResults;
}

// Adapts middleware objects provided by plugins to an internal interface. In
// particular, this implements fallthrough logic for when a plugin defines some
// methods (e.g. execute) but doesn't implement others (e.g. interrupt). Note
// that HydrogenKernelMiddleware objects are mutable: they may lose/gain methods
// at any time, including in the middle of processing a request. This class also
// adds basic checks that messages passed via the `onResults` callbacks are not
// missing key mandatory fields specified in the Jupyter messaging spec.

var MiddlewareAdapter = (function () {
  function MiddlewareAdapter(middleware, next) {
    _classCallCheck(this, MiddlewareAdapter);

    this._middleware = middleware;
    this._next = next;
  }

  // The return value of this method gets passed to plugins! For now we just
  // return the MiddlewareAdapter object itself, which is why all private
  // functionality is prefixed with _, and why MiddlewareAdapter is marked as
  // implementing HydrogenKernelMiddlewareThunk. Once multiple plugin API
  // versions exist, we may want to generate a HydrogenKernelMiddlewareThunk
  // specialized for a particular plugin API version.

  _createClass(MiddlewareAdapter, [{
    key: "interrupt",
    value: function interrupt() {
      if (this._middleware.interrupt) {
        this._middleware.interrupt(this._nextAsPluginType);
      } else {
        this._next.interrupt();
      }
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      if (this._middleware.shutdown) {
        this._middleware.shutdown(this._nextAsPluginType);
      } else {
        this._next.shutdown();
      }
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      if (this._middleware.restart) {
        this._middleware.restart(this._nextAsPluginType, onRestarted);
      } else {
        this._next.restart(onRestarted);
      }
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      // We don't want to repeatedly wrap the onResults callback every time we
      // fall through, but we need to do it at least once before delegating to
      // the KernelTransport.
      var safeOnResults = this._middleware.execute || this._next instanceof _kernelTransport2["default"] ? protectFromInvalidMessages(onResults) : onResults;

      if (this._middleware.execute) {
        this._middleware.execute(this._nextAsPluginType, code, safeOnResults);
      } else {
        this._next.execute(code, safeOnResults);
      }
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      var safeOnResults = this._middleware.complete || this._next instanceof _kernelTransport2["default"] ? protectFromInvalidMessages(onResults) : onResults;

      if (this._middleware.complete) {
        this._middleware.complete(this._nextAsPluginType, code, safeOnResults);
      } else {
        this._next.complete(code, safeOnResults);
      }
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      var safeOnResults = this._middleware.inspect || this._next instanceof _kernelTransport2["default"] ? protectFromInvalidMessages(onResults) : onResults;
      if (this._middleware.inspect) {
        this._middleware.inspect(this._nextAsPluginType, code, cursorPos, safeOnResults);
      } else {
        this._next.inspect(code, cursorPos, safeOnResults);
      }
    }
  }, {
    key: "_nextAsPluginType",
    get: function get() {
      if (this._next instanceof _kernelTransport2["default"]) {
        throw new Error("MiddlewareAdapter: _nextAsPluginType must never be called when _next is KernelTransport");
      }
      return this._next;
    }
  }]);

  return MiddlewareAdapter;
})();

var Kernel = (function () {
  var _instanceInitializers = {};
  var _instanceInitializers = {};

  _createDecoratedClass(Kernel, [{
    key: "inspector",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return { bundle: {} };
    },
    enumerable: true
  }], null, _instanceInitializers);

  function Kernel(kernel) {
    _classCallCheck(this, Kernel);

    _defineDecoratedPropertyDescriptor(this, "inspector", _instanceInitializers);

    this.outputStore = new _storeOutput2["default"]();
    this.watchCallbacks = [];
    this.emitter = new _atom.Emitter();
    this.pluginWrapper = null;

    this.transport = kernel;

    this.watchesStore = new _storeWatches2["default"](this);

    // A MiddlewareAdapter that forwards all requests to `this.transport`.
    // Needed to terminate the middleware chain in a way such that the `next`
    // object passed to the last middleware is not the KernelTransport instance
    // itself (which would be violate isolation of internals from plugins).
    var delegateToTransport = new MiddlewareAdapter({}, this.transport);
    this.middleware = [delegateToTransport];
  }

  _createDecoratedClass(Kernel, [{
    key: "addMiddleware",
    value: function addMiddleware(middleware) {
      this.middleware.unshift(new MiddlewareAdapter(middleware, this.middleware[0]));
    }
  }, {
    key: "setExecutionState",
    value: function setExecutionState(state) {
      this.transport.setExecutionState(state);
    }
  }, {
    key: "setInspectorResult",
    decorators: [_mobx.action],
    value: _asyncToGenerator(function* (bundle, editor) {
      if ((0, _lodash.isEqual)(this.inspector.bundle, bundle)) {
        yield atom.workspace.toggle(_utils.INSPECTOR_URI);
      } else if (bundle.size !== 0) {
        this.inspector.bundle = bundle;
        yield atom.workspace.open(_utils.INSPECTOR_URI, { searchAllPanes: true });
      }
      (0, _utils.focus)(editor);
    })
  }, {
    key: "getPluginWrapper",
    value: function getPluginWrapper() {
      if (!this.pluginWrapper) {
        this.pluginWrapper = new _pluginApiHydrogenKernel2["default"](this);
      }

      return this.pluginWrapper;
    }
  }, {
    key: "addWatchCallback",
    value: function addWatchCallback(watchCallback) {
      this.watchCallbacks.push(watchCallback);
    }
  }, {
    key: "interrupt",
    value: function interrupt() {
      this.firstMiddlewareAdapter.interrupt();
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      this.firstMiddlewareAdapter.shutdown();
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      this.firstMiddlewareAdapter.restart(onRestarted);
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      var _this = this;

      var wrappedOnResults = this._wrapExecutionResultsCallback(onResults);
      this.firstMiddlewareAdapter.execute(code, function (message, channel) {
        wrappedOnResults(message, channel);

        if (channel == "iopub" && message.header.msg_type === "status" && message.content.execution_state === "idle") {
          _this._callWatchCallbacks();
        }
      });
    }
  }, {
    key: "executeWatch",
    value: function executeWatch(code, onResults) {
      this.firstMiddlewareAdapter.execute(code, this._wrapExecutionResultsCallback(onResults));
    }
  }, {
    key: "_callWatchCallbacks",
    value: function _callWatchCallbacks() {
      this.watchCallbacks.forEach(function (watchCallback) {
        return watchCallback();
      });
    }

    /*
     * Takes a callback that accepts execution results in a hydrogen-internal
     * format and wraps it to accept Jupyter message/channel pairs instead.
     * Kernels and plugins all operate on types specified by the Jupyter messaging
     * protocol in order to maximize compatibility, but hydrogen internally uses
     * its own types.
     */
  }, {
    key: "_wrapExecutionResultsCallback",
    value: function _wrapExecutionResultsCallback(onResults) {
      var _this2 = this;

      return function (message, channel) {
        if (channel === "shell") {
          var _status = message.content.status;

          if (_status === "error" || _status === "ok") {
            onResults({
              data: _status,
              stream: "status"
            });
          } else {
            console.warn("Kernel: ignoring unexpected value for message.content.status");
          }
        } else if (channel === "iopub") {
          if (message.header.msg_type === "execute_input") {
            onResults({
              data: message.content.execution_count,
              stream: "execution_count"
            });
          }

          // TODO(nikita): Consider converting to V5 elsewhere, so that plugins
          // never have to deal with messages in the V4 format
          var result = (0, _utils.msgSpecToNotebookFormat)((0, _utils.msgSpecV4toV5)(message));
          onResults(result);
        } else if (channel === "stdin") {
          if (message.header.msg_type !== "input_request") {
            return;
          }

          var _message$content = message.content;
          var _prompt = _message$content.prompt;
          var password = _message$content.password;

          // TODO(nikita): perhaps it would make sense to install middleware for
          // sending input replies
          var inputView = new _inputView2["default"]({ prompt: _prompt, password: password }, function (input) {
            return _this2.transport.inputReply(input);
          });

          inputView.attach();
        }
      };
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      this.firstMiddlewareAdapter.complete(code, function (message, channel) {
        if (channel !== "shell") {
          (0, _utils.log)("Invalid reply: wrong channel");
          return;
        }
        onResults(message.content);
      });
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      this.firstMiddlewareAdapter.inspect(code, cursorPos, function (message, channel) {
        if (channel !== "shell") {
          (0, _utils.log)("Invalid reply: wrong channel");
          return;
        }
        onResults({
          data: message.content.data,
          found: message.content.found
        });
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("Kernel: Destroying");
      _store2["default"].deleteKernel(this);
      this.transport.destroy();
      if (this.pluginWrapper) {
        this.pluginWrapper.destroyed = true;
      }
      this.emitter.emit("did-destroy");
      this.emitter.dispose();
    }
  }, {
    key: "kernelSpec",
    get: function get() {
      return this.transport.kernelSpec;
    }
  }, {
    key: "grammar",
    get: function get() {
      return this.transport.grammar;
    }
  }, {
    key: "language",
    get: function get() {
      return this.transport.language;
    }
  }, {
    key: "displayName",
    get: function get() {
      return this.transport.displayName;
    }
  }, {
    key: "firstMiddlewareAdapter",
    get: function get() {
      return this.middleware[0];
    }
  }, {
    key: "executionState",
    decorators: [_mobx.computed],
    get: function get() {
      return this.transport.executionState;
    }
  }], null, _instanceInitializers);

  return Kernel;
})();

exports["default"] = Kernel;
module.exports = exports["default"];

// Invariant: the `._next` of each entry in this array must point to the next
// element of the array. The `._next` of the last element must point to
// `this.transport`.
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQkFFd0IsTUFBTTs7b0JBQ2UsTUFBTTs7c0JBQzNCLFFBQVE7O3FCQVF6QixTQUFTOztxQkFDRSxTQUFTOzs7OzRCQUVGLGlCQUFpQjs7OzsyQkFDbEIsZ0JBQWdCOzs7O3VDQUNiLDhCQUE4Qjs7Ozt5QkFLbkMsY0FBYzs7OzsrQkFDUixvQkFBb0I7Ozs7QUFHaEQsU0FBUywwQkFBMEIsQ0FDakMsU0FBMEIsRUFDVDtBQUNqQixNQUFNLGdCQUFpQyxHQUFHLFNBQXBDLGdCQUFpQyxDQUFJLE9BQU8sRUFBRSxPQUFPLEVBQUs7QUFDOUQsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLHNCQUFJLHVCQUF1QixDQUFDLENBQUM7QUFDN0IsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3BCLHNCQUFJLGtDQUFrQyxDQUFDLENBQUM7QUFDeEMsYUFBTztLQUNSOztBQUVELFFBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEtBQUssVUFBVSxFQUFFOztBQUVsRCxzQkFBSSxvQ0FBb0MsQ0FBQyxDQUFDO0FBQzFDLGFBQU87S0FDUjs7QUFFRCxRQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtBQUMxQixzQkFBSSx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzlDLGFBQU87S0FDUjs7QUFFRCxRQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7QUFDakMsc0JBQUksK0NBQStDLENBQUMsQ0FBQztBQUNyRCxhQUFPO0tBQ1I7O0FBRUQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFO0FBQ25DLHNCQUFJLGlEQUFpRCxDQUFDLENBQUM7QUFDdkQsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO0FB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QUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0tBQy9COzs7U0FFVyxlQUFXO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7S0FDaEM7OztTQUVjLGVBQVc7QUFDeEIsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztLQUNuQzs7O1NBRXlCLGVBQXNCO0FBQzlDLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMzQjs7OztTQVNpQixlQUFXO0FBQzNCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7S0FDdEM7OztTQTFEa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL3Jvb3QvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2tlcm5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IEVtaXR0ZXIgfSBmcm9tIFwiYXRvbVwiO1xuaW1wb3J0IHsgb2JzZXJ2YWJsZSwgYWN0aW9uLCBjb21wdXRlZCB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgeyBpc0VxdWFsIH0gZnJvbSBcImxvZGFzaFwiO1xuXG5pbXBvcnQge1xuICBsb2csXG4gIGZvY3VzLFxuICBtc2dTcGVjVG9Ob3RlYm9va0Zvcm1hdCxcbiAgbXNnU3BlY1Y0dG9WNSxcbiAgSU5TUEVDVE9SX1VSSVxufSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5cbmltcG9ydCBXYXRjaGVzU3RvcmUgZnJvbSBcIi4vc3RvcmUvd2F0Y2hlc1wiO1xuaW1wb3J0IE91dHB1dFN0b3JlIGZyb20gXCIuL3N0b3JlL291dHB1dFwiO1xuaW1wb3J0IEh5ZHJvZ2VuS2VybmVsIGZyb20gXCIuL3BsdWdpbi1hcGkvaHlkcm9nZW4ta2VybmVsXCI7XG5pbXBvcnQgdHlwZSB7XG4gIEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZVRodW5rLFxuICBIeWRyb2dlbktlcm5lbE1pZGRsZXdhcmVcbn0gZnJvbSBcIi4vcGx1Z2luLWFwaS9oeWRyb2dlbi10eXBlc1wiO1xuaW1wb3J0IElucHV0VmlldyBmcm9tIFwiLi9pbnB1dC12aWV3XCI7XG5pbXBvcnQgS2VybmVsVHJhbnNwb3J0IGZyb20gXCIuL2tlcm5lbC10cmFuc3BvcnRcIjtcbmltcG9ydCB0eXBlIHsgUmVzdWx0c0NhbGxiYWNrIH0gZnJvbSBcIi4va2VybmVsLXRyYW5zcG9ydFwiO1xuXG5mdW5jdGlvbiBwcm90ZWN0RnJvbUludmFsaWRNZXNzYWdlcyhcbiAgb25SZXN1bHRzOiBSZXN1bHRzQ2FsbGJhY2tcbik6IFJlc3VsdHNDYWxsYmFjayB7XG4gIGNvbnN0IHdyYXBwZWRPblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjayA9IChtZXNzYWdlLCBjaGFubmVsKSA9PiB7XG4gICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IG51bGxcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmNvbnRlbnQpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBjb250ZW50XCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLmNvbnRlbnQuZXhlY3V0aW9uX3N0YXRlID09PSBcInN0YXJ0aW5nXCIpIHtcbiAgICAgIC8vIEtlcm5lbHMgc2VuZCBhIHN0YXJ0aW5nIHN0YXR1cyBtZXNzYWdlIHdpdGggYW4gZW1wdHkgcGFyZW50X2hlYWRlclxuICAgICAgbG9nKFwiRHJvcHBlZCBzdGFydGluZyBzdGF0dXMgSU8gbWVzc2FnZVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UucGFyZW50X2hlYWRlcikge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXJcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLnBhcmVudF9oZWFkZXIubXNnX2lkKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgcGFyZW50X2hlYWRlci5tc2dfaWRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLnBhcmVudF9oZWFkZXIubXNnX3R5cGUpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBwYXJlbnRfaGVhZGVyLm1zZ190eXBlXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5oZWFkZXIpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBoZWFkZXJcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmhlYWRlci5tc2dfaWQpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBoZWFkZXIubXNnX2lkXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5oZWFkZXIubXNnX3R5cGUpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBoZWFkZXIubXNnX3R5cGVcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgb25SZXN1bHRzKG1lc3NhZ2UsIGNoYW5uZWwpO1xuICB9O1xuICByZXR1cm4gd3JhcHBlZE9uUmVzdWx0cztcbn1cblxuLy8gQWRhcHRzIG1pZGRsZXdhcmUgb2JqZWN0cyBwcm92aWRlZCBieSBwbHVnaW5zIHRvIGFuIGludGVybmFsIGludGVyZmFjZS4gSW5cbi8vIHBhcnRpY3VsYXIsIHRoaXMgaW1wbGVtZW50cyBmYWxsdGhyb3VnaCBsb2dpYyBmb3Igd2hlbiBhIHBsdWdpbiBkZWZpbmVzIHNvbWVcbi8vIG1ldGhvZHMgKGUuZy4gZXhlY3V0ZSkgYnV0IGRvZXNuJ3QgaW1wbGVtZW50IG90aGVycyAoZS5nLiBpbnRlcnJ1cHQpLiBOb3RlXG4vLyB0aGF0IEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZSBvYmplY3RzIGFyZSBtdXRhYmxlOiB0aGV5IG1heSBsb3NlL2dhaW4gbWV0aG9kc1xuLy8gYXQgYW55IHRpbWUsIGluY2x1ZGluZyBpbiB0aGUgbWlkZGxlIG9mIHByb2Nlc3NpbmcgYSByZXF1ZXN0LiBUaGlzIGNsYXNzIGFsc29cbi8vIGFkZHMgYmFzaWMgY2hlY2tzIHRoYXQgbWVzc2FnZXMgcGFzc2VkIHZpYSB0aGUgYG9uUmVzdWx0c2AgY2FsbGJhY2tzIGFyZSBub3Rcbi8vIG1pc3Npbmcga2V5IG1hbmRhdG9yeSBmaWVsZHMgc3BlY2lmaWVkIGluIHRoZSBKdXB5dGVyIG1lc3NhZ2luZyBzcGVjLlxuY2xhc3MgTWlkZGxld2FyZUFkYXB0ZXIgaW1wbGVtZW50cyBIeWRyb2dlbktlcm5lbE1pZGRsZXdhcmVUaHVuayB7XG4gIF9taWRkbGV3YXJlOiBIeWRyb2dlbktlcm5lbE1pZGRsZXdhcmU7XG4gIF9uZXh0OiBNaWRkbGV3YXJlQWRhcHRlciB8IEtlcm5lbFRyYW5zcG9ydDtcbiAgY29uc3RydWN0b3IoXG4gICAgbWlkZGxld2FyZTogSHlkcm9nZW5LZXJuZWxNaWRkbGV3YXJlLFxuICAgIG5leHQ6IE1pZGRsZXdhcmVBZGFwdGVyIHwgS2VybmVsVHJhbnNwb3J0XG4gICkge1xuICAgIHRoaXMuX21pZGRsZXdhcmUgPSBtaWRkbGV3YXJlO1xuICAgIHRoaXMuX25leHQgPSBuZXh0O1xuICB9XG5cbiAgLy8gVGhlIHJldHVybiB2YWx1ZSBvZiB0aGlzIG1ldGhvZCBnZXRzIHBhc3NlZCB0byBwbHVnaW5zISBGb3Igbm93IHdlIGp1c3RcbiAgLy8gcmV0dXJuIHRoZSBNaWRkbGV3YXJlQWRhcHRlciBvYmplY3QgaXRzZWxmLCB3aGljaCBpcyB3aHkgYWxsIHByaXZhdGVcbiAgLy8gZnVuY3Rpb25hbGl0eSBpcyBwcmVmaXhlZCB3aXRoIF8sIGFuZCB3aHkgTWlkZGxld2FyZUFkYXB0ZXIgaXMgbWFya2VkIGFzXG4gIC8vIGltcGxlbWVudGluZyBIeWRyb2dlbktlcm5lbE1pZGRsZXdhcmVUaHVuay4gT25jZSBtdWx0aXBsZSBwbHVnaW4gQVBJXG4gIC8vIHZlcnNpb25zIGV4aXN0LCB3ZSBtYXkgd2FudCB0byBnZW5lcmF0ZSBhIEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZVRodW5rXG4gIC8vIHNwZWNpYWxpemVkIGZvciBhIHBhcnRpY3VsYXIgcGx1Z2luIEFQSSB2ZXJzaW9uLlxuICBnZXQgX25leHRBc1BsdWdpblR5cGUoKTogSHlkcm9nZW5LZXJuZWxNaWRkbGV3YXJlVGh1bmsge1xuICAgIGlmICh0aGlzLl9uZXh0IGluc3RhbmNlb2YgS2VybmVsVHJhbnNwb3J0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiTWlkZGxld2FyZUFkYXB0ZXI6IF9uZXh0QXNQbHVnaW5UeXBlIG11c3QgbmV2ZXIgYmUgY2FsbGVkIHdoZW4gX25leHQgaXMgS2VybmVsVHJhbnNwb3J0XCJcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9uZXh0O1xuICB9XG5cbiAgaW50ZXJydXB0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9taWRkbGV3YXJlLmludGVycnVwdCkge1xuICAgICAgdGhpcy5fbWlkZGxld2FyZS5pbnRlcnJ1cHQodGhpcy5fbmV4dEFzUGx1Z2luVHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25leHQuaW50ZXJydXB0KCk7XG4gICAgfVxuICB9XG5cbiAgc2h1dGRvd24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21pZGRsZXdhcmUuc2h1dGRvd24pIHtcbiAgICAgIHRoaXMuX21pZGRsZXdhcmUuc2h1dGRvd24odGhpcy5fbmV4dEFzUGx1Z2luVHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25leHQuc2h1dGRvd24oKTtcbiAgICB9XG4gIH1cblxuICByZXN0YXJ0KG9uUmVzdGFydGVkOiA/RnVuY3Rpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbWlkZGxld2FyZS5yZXN0YXJ0KSB7XG4gICAgICB0aGlzLl9taWRkbGV3YXJlLnJlc3RhcnQodGhpcy5fbmV4dEFzUGx1Z2luVHlwZSwgb25SZXN0YXJ0ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uZXh0LnJlc3RhcnQob25SZXN0YXJ0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjayk6IHZvaWQge1xuICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gcmVwZWF0ZWRseSB3cmFwIHRoZSBvblJlc3VsdHMgY2FsbGJhY2sgZXZlcnkgdGltZSB3ZVxuICAgIC8vIGZhbGwgdGhyb3VnaCwgYnV0IHdlIG5lZWQgdG8gZG8gaXQgYXQgbGVhc3Qgb25jZSBiZWZvcmUgZGVsZWdhdGluZyB0b1xuICAgIC8vIHRoZSBLZXJuZWxUcmFuc3BvcnQuXG4gICAgbGV0IHNhZmVPblJlc3VsdHMgPVxuICAgICAgdGhpcy5fbWlkZGxld2FyZS5leGVjdXRlIHx8IHRoaXMuX25leHQgaW5zdGFuY2VvZiBLZXJuZWxUcmFuc3BvcnRcbiAgICAgICAgPyBwcm90ZWN0RnJvbUludmFsaWRNZXNzYWdlcyhvblJlc3VsdHMpXG4gICAgICAgIDogb25SZXN1bHRzO1xuXG4gICAgaWYgKHRoaXMuX21pZGRsZXdhcmUuZXhlY3V0ZSkge1xuICAgICAgdGhpcy5fbWlkZGxld2FyZS5leGVjdXRlKHRoaXMuX25leHRBc1BsdWdpblR5cGUsIGNvZGUsIHNhZmVPblJlc3VsdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uZXh0LmV4ZWN1dGUoY29kZSwgc2FmZU9uUmVzdWx0cyk7XG4gICAgfVxuICB9XG5cbiAgY29tcGxldGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjayk6IHZvaWQge1xuICAgIGxldCBzYWZlT25SZXN1bHRzID1cbiAgICAgIHRoaXMuX21pZGRsZXdhcmUuY29tcGxldGUgfHwgdGhpcy5fbmV4dCBpbnN0YW5jZW9mIEtlcm5lbFRyYW5zcG9ydFxuICAgICAgICA/IHByb3RlY3RGcm9tSW52YWxpZE1lc3NhZ2VzKG9uUmVzdWx0cylcbiAgICAgICAgOiBvblJlc3VsdHM7XG5cbiAgICBpZiAodGhpcy5fbWlkZGxld2FyZS5jb21wbGV0ZSkge1xuICAgICAgdGhpcy5fbWlkZGxld2FyZS5jb21wbGV0ZSh0aGlzLl9uZXh0QXNQbHVnaW5UeXBlLCBjb2RlLCBzYWZlT25SZXN1bHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmV4dC5jb21wbGV0ZShjb2RlLCBzYWZlT25SZXN1bHRzKTtcbiAgICB9XG4gIH1cblxuICBpbnNwZWN0KGNvZGU6IHN0cmluZywgY3Vyc29yUG9zOiBudW1iZXIsIG9uUmVzdWx0czogUmVzdWx0c0NhbGxiYWNrKTogdm9pZCB7XG4gICAgbGV0IHNhZmVPblJlc3VsdHMgPVxuICAgICAgdGhpcy5fbWlkZGxld2FyZS5pbnNwZWN0IHx8IHRoaXMuX25leHQgaW5zdGFuY2VvZiBLZXJuZWxUcmFuc3BvcnRcbiAgICAgICAgPyBwcm90ZWN0RnJvbUludmFsaWRNZXNzYWdlcyhvblJlc3VsdHMpXG4gICAgICAgIDogb25SZXN1bHRzO1xuICAgIGlmICh0aGlzLl9taWRkbGV3YXJlLmluc3BlY3QpIHtcbiAgICAgIHRoaXMuX21pZGRsZXdhcmUuaW5zcGVjdChcbiAgICAgICAgdGhpcy5fbmV4dEFzUGx1Z2luVHlwZSxcbiAgICAgICAgY29kZSxcbiAgICAgICAgY3Vyc29yUG9zLFxuICAgICAgICBzYWZlT25SZXN1bHRzXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uZXh0Lmluc3BlY3QoY29kZSwgY3Vyc29yUG9zLCBzYWZlT25SZXN1bHRzKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2VybmVsIHtcbiAgQG9ic2VydmFibGUgaW5zcGVjdG9yID0geyBidW5kbGU6IHt9IH07XG4gIG91dHB1dFN0b3JlID0gbmV3IE91dHB1dFN0b3JlKCk7XG5cbiAgd2F0Y2hlc1N0b3JlOiBXYXRjaGVzU3RvcmU7XG4gIHdhdGNoQ2FsbGJhY2tzOiBBcnJheTxGdW5jdGlvbj4gPSBbXTtcblxuICBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgcGx1Z2luV3JhcHBlcjogSHlkcm9nZW5LZXJuZWwgfCBudWxsID0gbnVsbDtcbiAgdHJhbnNwb3J0OiBLZXJuZWxUcmFuc3BvcnQ7XG5cbiAgLy8gSW52YXJpYW50OiB0aGUgYC5fbmV4dGAgb2YgZWFjaCBlbnRyeSBpbiB0aGlzIGFycmF5IG11c3QgcG9pbnQgdG8gdGhlIG5leHRcbiAgLy8gZWxlbWVudCBvZiB0aGUgYXJyYXkuIFRoZSBgLl9uZXh0YCBvZiB0aGUgbGFzdCBlbGVtZW50IG11c3QgcG9pbnQgdG9cbiAgLy8gYHRoaXMudHJhbnNwb3J0YC5cbiAgbWlkZGxld2FyZTogQXJyYXk8TWlkZGxld2FyZUFkYXB0ZXI+O1xuXG4gIGNvbnN0cnVjdG9yKGtlcm5lbDogS2VybmVsVHJhbnNwb3J0KSB7XG4gICAgdGhpcy50cmFuc3BvcnQgPSBrZXJuZWw7XG5cbiAgICB0aGlzLndhdGNoZXNTdG9yZSA9IG5ldyBXYXRjaGVzU3RvcmUodGhpcyk7XG5cbiAgICAvLyBBIE1pZGRsZXdhcmVBZGFwdGVyIHRoYXQgZm9yd2FyZHMgYWxsIHJlcXVlc3RzIHRvIGB0aGlzLnRyYW5zcG9ydGAuXG4gICAgLy8gTmVlZGVkIHRvIHRlcm1pbmF0ZSB0aGUgbWlkZGxld2FyZSBjaGFpbiBpbiBhIHdheSBzdWNoIHRoYXQgdGhlIGBuZXh0YFxuICAgIC8vIG9iamVjdCBwYXNzZWQgdG8gdGhlIGxhc3QgbWlkZGxld2FyZSBpcyBub3QgdGhlIEtlcm5lbFRyYW5zcG9ydCBpbnN0YW5jZVxuICAgIC8vIGl0c2VsZiAod2hpY2ggd291bGQgYmUgdmlvbGF0ZSBpc29sYXRpb24gb2YgaW50ZXJuYWxzIGZyb20gcGx1Z2lucykuXG4gICAgY29uc3QgZGVsZWdhdGVUb1RyYW5zcG9ydCA9IG5ldyBNaWRkbGV3YXJlQWRhcHRlcih7fSwgdGhpcy50cmFuc3BvcnQpO1xuICAgIHRoaXMubWlkZGxld2FyZSA9IFtkZWxlZ2F0ZVRvVHJhbnNwb3J0XTtcbiAgfVxuXG4gIGdldCBrZXJuZWxTcGVjKCk6IEtlcm5lbHNwZWMge1xuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5rZXJuZWxTcGVjO1xuICB9XG5cbiAgZ2V0IGdyYW1tYXIoKTogYXRvbSRHcmFtbWFyIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuZ3JhbW1hcjtcbiAgfVxuXG4gIGdldCBsYW5ndWFnZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5sYW5ndWFnZTtcbiAgfVxuXG4gIGdldCBkaXNwbGF5TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5kaXNwbGF5TmFtZTtcbiAgfVxuXG4gIGdldCBmaXJzdE1pZGRsZXdhcmVBZGFwdGVyKCk6IE1pZGRsZXdhcmVBZGFwdGVyIHtcbiAgICByZXR1cm4gdGhpcy5taWRkbGV3YXJlWzBdO1xuICB9XG5cbiAgYWRkTWlkZGxld2FyZShtaWRkbGV3YXJlOiBIeWRyb2dlbktlcm5lbE1pZGRsZXdhcmUpIHtcbiAgICB0aGlzLm1pZGRsZXdhcmUudW5zaGlmdChcbiAgICAgIG5ldyBNaWRkbGV3YXJlQWRhcHRlcihtaWRkbGV3YXJlLCB0aGlzLm1pZGRsZXdhcmVbMF0pXG4gICAgKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZXhlY3V0aW9uU3RhdGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuZXhlY3V0aW9uU3RhdGU7XG4gIH1cblxuICBzZXRFeGVjdXRpb25TdGF0ZShzdGF0ZTogc3RyaW5nKSB7XG4gICAgdGhpcy50cmFuc3BvcnQuc2V0RXhlY3V0aW9uU3RhdGUoc3RhdGUpO1xuICB9XG5cbiAgQGFjdGlvblxuICBhc3luYyBzZXRJbnNwZWN0b3JSZXN1bHQoYnVuZGxlOiBPYmplY3QsIGVkaXRvcjogP2F0b20kVGV4dEVkaXRvcikge1xuICAgIGlmIChpc0VxdWFsKHRoaXMuaW5zcGVjdG9yLmJ1bmRsZSwgYnVuZGxlKSkge1xuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2UudG9nZ2xlKElOU1BFQ1RPUl9VUkkpO1xuICAgIH0gZWxzZSBpZiAoYnVuZGxlLnNpemUgIT09IDApIHtcbiAgICAgIHRoaXMuaW5zcGVjdG9yLmJ1bmRsZSA9IGJ1bmRsZTtcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oSU5TUEVDVE9SX1VSSSwgeyBzZWFyY2hBbGxQYW5lczogdHJ1ZSB9KTtcbiAgICB9XG4gICAgZm9jdXMoZWRpdG9yKTtcbiAgfVxuXG4gIGdldFBsdWdpbldyYXBwZXIoKSB7XG4gICAgaWYgKCF0aGlzLnBsdWdpbldyYXBwZXIpIHtcbiAgICAgIHRoaXMucGx1Z2luV3JhcHBlciA9IG5ldyBIeWRyb2dlbktlcm5lbCh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wbHVnaW5XcmFwcGVyO1xuICB9XG5cbiAgYWRkV2F0Y2hDYWxsYmFjayh3YXRjaENhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIHRoaXMud2F0Y2hDYWxsYmFja3MucHVzaCh3YXRjaENhbGxiYWNrKTtcbiAgfVxuXG4gIGludGVycnVwdCgpIHtcbiAgICB0aGlzLmZpcnN0TWlkZGxld2FyZUFkYXB0ZXIuaW50ZXJydXB0KCk7XG4gIH1cblxuICBzaHV0ZG93bigpIHtcbiAgICB0aGlzLmZpcnN0TWlkZGxld2FyZUFkYXB0ZXIuc2h1dGRvd24oKTtcbiAgfVxuXG4gIHJlc3RhcnQob25SZXN0YXJ0ZWQ6ID9GdW5jdGlvbikge1xuICAgIHRoaXMuZmlyc3RNaWRkbGV3YXJlQWRhcHRlci5yZXN0YXJ0KG9uUmVzdGFydGVkKTtcbiAgfVxuXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgY29uc3Qgd3JhcHBlZE9uUmVzdWx0cyA9IHRoaXMuX3dyYXBFeGVjdXRpb25SZXN1bHRzQ2FsbGJhY2sob25SZXN1bHRzKTtcbiAgICB0aGlzLmZpcnN0TWlkZGxld2FyZUFkYXB0ZXIuZXhlY3V0ZShcbiAgICAgIGNvZGUsXG4gICAgICAobWVzc2FnZTogTWVzc2FnZSwgY2hhbm5lbDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHdyYXBwZWRPblJlc3VsdHMobWVzc2FnZSwgY2hhbm5lbCk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGNoYW5uZWwgPT0gXCJpb3B1YlwiICYmXG4gICAgICAgICAgbWVzc2FnZS5oZWFkZXIubXNnX3R5cGUgPT09IFwic3RhdHVzXCIgJiZcbiAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQuZXhlY3V0aW9uX3N0YXRlID09PSBcImlkbGVcIlxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLl9jYWxsV2F0Y2hDYWxsYmFja3MoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBleGVjdXRlV2F0Y2goY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5maXJzdE1pZGRsZXdhcmVBZGFwdGVyLmV4ZWN1dGUoXG4gICAgICBjb2RlLFxuICAgICAgdGhpcy5fd3JhcEV4ZWN1dGlvblJlc3VsdHNDYWxsYmFjayhvblJlc3VsdHMpXG4gICAgKTtcbiAgfVxuXG4gIF9jYWxsV2F0Y2hDYWxsYmFja3MoKSB7XG4gICAgdGhpcy53YXRjaENhbGxiYWNrcy5mb3JFYWNoKHdhdGNoQ2FsbGJhY2sgPT4gd2F0Y2hDYWxsYmFjaygpKTtcbiAgfVxuXG4gIC8qXG4gICAqIFRha2VzIGEgY2FsbGJhY2sgdGhhdCBhY2NlcHRzIGV4ZWN1dGlvbiByZXN1bHRzIGluIGEgaHlkcm9nZW4taW50ZXJuYWxcbiAgICogZm9ybWF0IGFuZCB3cmFwcyBpdCB0byBhY2NlcHQgSnVweXRlciBtZXNzYWdlL2NoYW5uZWwgcGFpcnMgaW5zdGVhZC5cbiAgICogS2VybmVscyBhbmQgcGx1Z2lucyBhbGwgb3BlcmF0ZSBvbiB0eXBlcyBzcGVjaWZpZWQgYnkgdGhlIEp1cHl0ZXIgbWVzc2FnaW5nXG4gICAqIHByb3RvY29sIGluIG9yZGVyIHRvIG1heGltaXplIGNvbXBhdGliaWxpdHksIGJ1dCBoeWRyb2dlbiBpbnRlcm5hbGx5IHVzZXNcbiAgICogaXRzIG93biB0eXBlcy5cbiAgICovXG4gIF93cmFwRXhlY3V0aW9uUmVzdWx0c0NhbGxiYWNrKG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gKG1lc3NhZ2U6IE1lc3NhZ2UsIGNoYW5uZWw6IHN0cmluZykgPT4ge1xuICAgICAgaWYgKGNoYW5uZWwgPT09IFwic2hlbGxcIikge1xuICAgICAgICBjb25zdCB7IHN0YXR1cyB9ID0gbWVzc2FnZS5jb250ZW50O1xuICAgICAgICBpZiAoc3RhdHVzID09PSBcImVycm9yXCIgfHwgc3RhdHVzID09PSBcIm9rXCIpIHtcbiAgICAgICAgICBvblJlc3VsdHMoe1xuICAgICAgICAgICAgZGF0YTogc3RhdHVzLFxuICAgICAgICAgICAgc3RyZWFtOiBcInN0YXR1c1wiXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgXCJLZXJuZWw6IGlnbm9yaW5nIHVuZXhwZWN0ZWQgdmFsdWUgZm9yIG1lc3NhZ2UuY29udGVudC5zdGF0dXNcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY2hhbm5lbCA9PT0gXCJpb3B1YlwiKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLmhlYWRlci5tc2dfdHlwZSA9PT0gXCJleGVjdXRlX2lucHV0XCIpIHtcbiAgICAgICAgICBvblJlc3VsdHMoe1xuICAgICAgICAgICAgZGF0YTogbWVzc2FnZS5jb250ZW50LmV4ZWN1dGlvbl9jb3VudCxcbiAgICAgICAgICAgIHN0cmVhbTogXCJleGVjdXRpb25fY291bnRcIlxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETyhuaWtpdGEpOiBDb25zaWRlciBjb252ZXJ0aW5nIHRvIFY1IGVsc2V3aGVyZSwgc28gdGhhdCBwbHVnaW5zXG4gICAgICAgIC8vIG5ldmVyIGhhdmUgdG8gZGVhbCB3aXRoIG1lc3NhZ2VzIGluIHRoZSBWNCBmb3JtYXRcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbXNnU3BlY1RvTm90ZWJvb2tGb3JtYXQobXNnU3BlY1Y0dG9WNShtZXNzYWdlKSk7XG4gICAgICAgIG9uUmVzdWx0cyhyZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmIChjaGFubmVsID09PSBcInN0ZGluXCIpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuaGVhZGVyLm1zZ190eXBlICE9PSBcImlucHV0X3JlcXVlc3RcIikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgcHJvbXB0LCBwYXNzd29yZCB9ID0gbWVzc2FnZS5jb250ZW50O1xuXG4gICAgICAgIC8vIFRPRE8obmlraXRhKTogcGVyaGFwcyBpdCB3b3VsZCBtYWtlIHNlbnNlIHRvIGluc3RhbGwgbWlkZGxld2FyZSBmb3JcbiAgICAgICAgLy8gc2VuZGluZyBpbnB1dCByZXBsaWVzXG4gICAgICAgIGNvbnN0IGlucHV0VmlldyA9IG5ldyBJbnB1dFZpZXcoeyBwcm9tcHQsIHBhc3N3b3JkIH0sIChpbnB1dDogc3RyaW5nKSA9PlxuICAgICAgICAgIHRoaXMudHJhbnNwb3J0LmlucHV0UmVwbHkoaW5wdXQpXG4gICAgICAgICk7XG5cbiAgICAgICAgaW5wdXRWaWV3LmF0dGFjaCgpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBjb21wbGV0ZShjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICB0aGlzLmZpcnN0TWlkZGxld2FyZUFkYXB0ZXIuY29tcGxldGUoXG4gICAgICBjb2RlLFxuICAgICAgKG1lc3NhZ2U6IE1lc3NhZ2UsIGNoYW5uZWw6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoY2hhbm5lbCAhPT0gXCJzaGVsbFwiKSB7XG4gICAgICAgICAgbG9nKFwiSW52YWxpZCByZXBseTogd3JvbmcgY2hhbm5lbFwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb25SZXN1bHRzKG1lc3NhZ2UuY29udGVudCk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGluc3BlY3QoY29kZTogc3RyaW5nLCBjdXJzb3JQb3M6IG51bWJlciwgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRoaXMuZmlyc3RNaWRkbGV3YXJlQWRhcHRlci5pbnNwZWN0KFxuICAgICAgY29kZSxcbiAgICAgIGN1cnNvclBvcyxcbiAgICAgIChtZXNzYWdlOiBNZXNzYWdlLCBjaGFubmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGNoYW5uZWwgIT09IFwic2hlbGxcIikge1xuICAgICAgICAgIGxvZyhcIkludmFsaWQgcmVwbHk6IHdyb25nIGNoYW5uZWxcIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG9uUmVzdWx0cyh7XG4gICAgICAgICAgZGF0YTogbWVzc2FnZS5jb250ZW50LmRhdGEsXG4gICAgICAgICAgZm91bmQ6IG1lc3NhZ2UuY29udGVudC5mb3VuZFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJLZXJuZWw6IERlc3Ryb3lpbmdcIik7XG4gICAgc3RvcmUuZGVsZXRlS2VybmVsKHRoaXMpO1xuICAgIHRoaXMudHJhbnNwb3J0LmRlc3Ryb3koKTtcbiAgICBpZiAodGhpcy5wbHVnaW5XcmFwcGVyKSB7XG4gICAgICB0aGlzLnBsdWdpbldyYXBwZXIuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoXCJkaWQtZGVzdHJveVwiKTtcbiAgICB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=