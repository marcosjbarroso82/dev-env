Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _atom = require("atom");

var _mobx = require("mobx");

var _utils = require("./../utils");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require("./../config");

var _config2 = _interopRequireDefault(_config);

var _codeManager = require("./../code-manager");

var codeManager = _interopRequireWildcard(_codeManager);

var _markers = require("./markers");

var _markers2 = _interopRequireDefault(_markers);

var _kernelManager = require("./../kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _kernel = require("./../kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var commutable = require("@nteract/commutable");

var Store = (function () {
  var _instanceInitializers = {};

  function Store() {
    _classCallCheck(this, Store);

    this.subscriptions = new _atom.CompositeDisposable();
    this.markers = new _markers2["default"]();
    this.runningKernels = (0, _mobx.observable)([]);

    _defineDecoratedPropertyDescriptor(this, "kernelMapping", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "startingKernels", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "editor", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "grammar", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "configMapping", _instanceInitializers);

    this.globalMode = Boolean(atom.config.get("Hydrogen.globalMode"));
  }

  _createDecoratedClass(Store, [{
    key: "startKernel",
    decorators: [_mobx.action],
    value: function startKernel(kernelDisplayName) {
      this.startingKernels.set(kernelDisplayName, true);
    }
  }, {
    key: "newKernel",
    decorators: [_mobx.action],
    value: function newKernel(kernel, filePath, editor, grammar) {
      if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
        if (!this.kernelMapping.has(filePath)) {
          this.kernelMapping.set(filePath, new Map());
        }
        var multiLanguageMap = this.kernelMapping.get(filePath);
        multiLanguageMap.set(grammar.name, kernel);
      } else {
        this.kernelMapping.set(filePath, kernel);
      }
      var index = this.runningKernels.findIndex(function (k) {
        return k === kernel;
      });
      if (index === -1) {
        this.runningKernels.push(kernel);
      }
      // delete startingKernel since store.kernel now in place to prevent duplicate kernel
      this.startingKernels["delete"](kernel.kernelSpec.display_name);
    }
  }, {
    key: "deleteKernel",
    decorators: [_mobx.action],
    value: function deleteKernel(kernel) {
      var _this = this;

      var grammar = kernel.grammar.name;
      var files = this.getFilesForKernel(kernel);

      files.forEach(function (file) {
        var kernelOrMap = _this.kernelMapping.get(file);
        if (!kernelOrMap) return;
        if (kernelOrMap instanceof _kernel2["default"]) {
          _this.kernelMapping["delete"](file);
        } else {
          kernelOrMap["delete"](grammar);
        }
      });

      this.runningKernels.remove(kernel);
    }
  }, {
    key: "getFilesForKernel",
    value: function getFilesForKernel(kernel) {
      var _this2 = this;

      var grammar = kernel.grammar.name;
      return this.filePaths.filter(function (file) {
        var kernelOrMap = _this2.kernelMapping.get(file);
        return kernelOrMap instanceof _kernel2["default"] ? kernelOrMap === kernel : kernelOrMap.get(grammar) === kernel;
      });
    }
  }, {
    key: "dispose",
    decorators: [_mobx.action],
    value: function dispose() {
      this.subscriptions.dispose();
      this.markers.clear();
      this.runningKernels.forEach(function (kernel) {
        return kernel.destroy();
      });
      this.runningKernels.clear();
      this.kernelMapping.clear();
    }
  }, {
    key: "updateEditor",
    decorators: [_mobx.action],
    value: function updateEditor(editor) {
      this.editor = editor;
      this.setGrammar(editor);

      if (this.globalMode && this.kernel && editor) {
        var fileName = editor.getPath();
        if (!fileName) return;
        this.kernelMapping.set(fileName, this.kernel);
      }
    }
  }, {
    key: "setGrammar",
    decorators: [_mobx.action],
    value: function setGrammar(editor) {
      if (!editor) {
        this.grammar = null;
        return;
      }

      var grammar = editor.getGrammar();

      if ((0, _utils.isMultilanguageGrammar)(grammar)) {
        var embeddedScope = (0, _utils.getEmbeddedScope)(editor, editor.getCursorBufferPosition());

        if (embeddedScope) {
          var scope = embeddedScope.replace(".embedded", "");
          grammar = atom.grammars.grammarForScopeName(scope);
        }
      }

      this.grammar = grammar;
    }
  }, {
    key: "setConfigValue",
    decorators: [_mobx.action],
    value: function setConfigValue(keyPath, newValue) {
      if (!newValue) {
        newValue = atom.config.get(keyPath);
      }
      this.configMapping.set(keyPath, newValue);
    }
  }, {
    key: "forceEditorUpdate",
    value: function forceEditorUpdate() {
      // Force mobx to recalculate filePath (which depends on editor observable)

      var currentEditor = this.editor;
      this.updateEditor(null);
      this.updateEditor(currentEditor);
    }
  }, {
    key: "kernelMapping",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return new Map();
    },
    enumerable: true
  }, {
    key: "startingKernels",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return new Map();
    },
    enumerable: true
  }, {
    key: "editor",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return atom.workspace.getActiveTextEditor();
    },
    enumerable: true
  }, {
    key: "grammar",
    decorators: [_mobx.observable],
    initializer: null,
    enumerable: true
  }, {
    key: "configMapping",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return new Map();
    },
    enumerable: true
  }, {
    key: "kernel",
    decorators: [_mobx.computed],
    get: function get() {
      var _this3 = this;

      if (this.globalMode) {
        var _ret = (function () {
          if (!_this3.grammar) return {
              v: null
            };
          var currentScopeName = _this3.grammar.scopeName;
          return {
            v: _this3.runningKernels.filter(function (k) {
              return k.grammar.scopeName === currentScopeName;
            })[0]
          };
        })();

        if (typeof _ret === "object") return _ret.v;
      }

      if (!this.filePath) return null;
      var kernelOrMap = this.kernelMapping.get(this.filePath);
      if (!kernelOrMap || kernelOrMap instanceof _kernel2["default"]) return kernelOrMap;
      if (this.grammar) return kernelOrMap.get(this.grammar.name);
    }
  }, {
    key: "filePath",
    decorators: [_mobx.computed],
    get: function get() {
      return this.editor ? this.editor.getPath() : null;
    }
  }, {
    key: "filePaths",
    decorators: [_mobx.computed],
    get: function get() {
      return (0, _mobx.keys)(this.kernelMapping);
    }
  }, {
    key: "notebook",
    decorators: [_mobx.computed],
    get: function get() {
      var editor = this.editor;
      if (!editor) {
        return null;
      }
      // Should we consider starting off with a monocellNotebook ?
      var notebook = commutable.emptyNotebook;
      var cellRanges = codeManager.getCells(editor);
      _lodash2["default"].forEach(cellRanges, function (cell) {
        var start = cell.start;
        var end = cell.end;

        var source = codeManager.getTextInRange(editor, start, end);
        source = source ? source : "";
        var newCell = commutable.emptyCodeCell.set("source", source);
        notebook = commutable.appendCellToNotebook(notebook, newCell);
      });
      return commutable.toJS(notebook);
    }
  }], null, _instanceInitializers);

  return Store;
})();

exports.Store = Store;

var store = new Store();
exports["default"] = store;

// For debugging
window.hydrogen_store = store;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFb0MsTUFBTTs7b0JBUW5DLE1BQU07O3FCQUM0QyxZQUFZOztzQkFDdkQsUUFBUTs7OztzQkFFSCxhQUFhOzs7OzJCQUNILG1CQUFtQjs7SUFBcEMsV0FBVzs7dUJBQ0MsV0FBVzs7Ozs2QkFDVCxxQkFBcUI7Ozs7c0JBQzVCLGFBQWE7Ozs7QUFJaEMsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0lBRXJDLEtBQUs7OztXQUFMLEtBQUs7MEJBQUwsS0FBSzs7U0FDaEIsYUFBYSxHQUFHLCtCQUF5QjtTQUN6QyxPQUFPLEdBQUcsMEJBQWlCO1NBQzNCLGNBQWMsR0FBNkIsc0JBQVcsRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7U0FNekQsVUFBVSxHQUFZLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOzs7d0JBVDFELEtBQUs7OztXQXlETCxxQkFBQyxpQkFBeUIsRUFBRTtBQUNyQyxVQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNuRDs7OztXQUdRLG1CQUNQLE1BQWMsRUFDZCxRQUFnQixFQUNoQixNQUF1QixFQUN2QixPQUFxQixFQUNyQjtBQUNBLFVBQUksbUNBQXVCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFO0FBQy9DLFlBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNyQyxjQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO0FBQ0QsWUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRCx3QkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztPQUM1QyxNQUFNO0FBQ0wsWUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQzFDO0FBQ0QsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxLQUFLLE1BQU07T0FBQSxDQUFDLENBQUM7QUFDL0QsVUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDaEIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDbEM7O0FBRUQsVUFBSSxDQUFDLGVBQWUsVUFBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDN0Q7Ozs7V0FHVyxzQkFBQyxNQUFjLEVBQUU7OztBQUMzQixVQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNwQyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTdDLFdBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDcEIsWUFBTSxXQUFXLEdBQUcsTUFBSyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELFlBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTztBQUN6QixZQUFJLFdBQVcsK0JBQWtCLEVBQUU7QUFDakMsZ0JBQUssYUFBYSxVQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakMsTUFBTTtBQUNMLHFCQUFXLFVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM3QjtPQUNGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNwQzs7O1dBRWdCLDJCQUFDLE1BQWMsRUFBRTs7O0FBQ2hDLFVBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDbkMsWUFBTSxXQUFXLEdBQUcsT0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELGVBQU8sV0FBVywrQkFBa0IsR0FDaEMsV0FBVyxLQUFLLE1BQU0sR0FDdEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxNQUFNLENBQUM7T0FDekMsQ0FBQyxDQUFDO0tBQ0o7Ozs7V0FHTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDNUIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUM1Qjs7OztXQUdXLHNCQUFDLE1BQXdCLEVBQUU7QUFDckMsVUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFeEIsVUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxFQUFFO0FBQzVDLFlBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxZQUFJLENBQUMsUUFBUSxFQUFFLE9BQU87QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMvQztLQUNGOzs7O1dBR1Msb0JBQUMsTUFBd0IsRUFBRTtBQUNuQyxVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsZUFBTztPQUNSOztBQUVELFVBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFbEMsVUFBSSxtQ0FBdUIsT0FBTyxDQUFDLEVBQUU7QUFDbkMsWUFBTSxhQUFhLEdBQUcsNkJBQ3BCLE1BQU0sRUFDTixNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FDakMsQ0FBQzs7QUFFRixZQUFJLGFBQWEsRUFBRTtBQUNqQixjQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyRCxpQkFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEQ7T0FDRjs7QUFFRCxVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztLQUN4Qjs7OztXQUdhLHdCQUFDLE9BQWUsRUFBRSxRQUFnQixFQUFFO0FBQ2hELFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixnQkFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3JDO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNDOzs7V0FFZ0IsNkJBQUc7OztBQUdsQixVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEIsVUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNsQzs7Ozs7YUF4SzBDLElBQUksR0FBRyxFQUFFOzs7Ozs7O2FBQ0EsSUFBSSxHQUFHLEVBQUU7Ozs7Ozs7YUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRTs7Ozs7Ozs7Ozs7O2FBRVIsSUFBSSxHQUFHLEVBQUU7Ozs7OztTQUloRCxlQUFZOzs7QUFDcEIsVUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFOztBQUNuQixjQUFJLENBQUMsT0FBSyxPQUFPLEVBQUU7aUJBQU8sSUFBSTtjQUFDO0FBQy9CLGNBQU0sZ0JBQWdCLEdBQUcsT0FBSyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hEO2VBQU8sT0FBSyxjQUFjLENBQUMsTUFBTSxDQUMvQixVQUFBLENBQUM7cUJBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEtBQUssZ0JBQWdCO2FBQUEsQ0FDOUMsQ0FBQyxDQUFDLENBQUM7WUFBQzs7OztPQUNOOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2hDLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRCxVQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsK0JBQWtCLEVBQUUsT0FBTyxXQUFXLENBQUM7QUFDdEUsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdEOzs7O1NBR1csZUFBWTtBQUN0QixhQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7S0FDbkQ7Ozs7U0FHWSxlQUFtQjtBQUM5QixhQUFPLGdCQUFLLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNqQzs7OztTQUdXLGVBQUc7QUFDYixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7QUFDeEMsVUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRCwwQkFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQUEsSUFBSSxFQUFJO1lBQ3BCLEtBQUssR0FBVSxJQUFJLENBQW5CLEtBQUs7WUFBRSxHQUFHLEdBQUssSUFBSSxDQUFaLEdBQUc7O0FBQ2xCLFlBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1RCxjQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDOUIsWUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9ELGdCQUFRLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztPQUMvRCxDQUFDLENBQUM7QUFDSCxhQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbEM7OztTQXREVSxLQUFLOzs7OztBQStLbEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztxQkFDWCxLQUFLOzs7QUFHcEIsTUFBTSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiL3Jvb3QvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3N0b3JlL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XG5pbXBvcnQge1xuICBvYnNlcnZhYmxlLFxuICBjb21wdXRlZCxcbiAgYWN0aW9uLFxuICBpc09ic2VydmFibGVNYXAsXG4gIGtleXMsXG4gIHZhbHVlc1xufSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgaXNNdWx0aWxhbmd1YWdlR3JhbW1hciwgZ2V0RW1iZWRkZWRTY29wZSB9IGZyb20gXCIuLy4uL3V0aWxzXCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5cbmltcG9ydCBDb25maWcgZnJvbSBcIi4vLi4vY29uZmlnXCI7XG5pbXBvcnQgKiBhcyBjb2RlTWFuYWdlciBmcm9tIFwiLi8uLi9jb2RlLW1hbmFnZXJcIjtcbmltcG9ydCBNYXJrZXJTdG9yZSBmcm9tIFwiLi9tYXJrZXJzXCI7XG5pbXBvcnQga2VybmVsTWFuYWdlciBmcm9tIFwiLi8uLi9rZXJuZWwtbWFuYWdlclwiO1xuaW1wb3J0IEtlcm5lbCBmcm9tIFwiLi8uLi9rZXJuZWxcIjtcblxuaW1wb3J0IHR5cGUgeyBJT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSBcIm1vYnhcIjtcblxuY29uc3QgY29tbXV0YWJsZSA9IHJlcXVpcmUoXCJAbnRlcmFjdC9jb21tdXRhYmxlXCIpO1xuXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgbWFya2VycyA9IG5ldyBNYXJrZXJTdG9yZSgpO1xuICBydW5uaW5nS2VybmVsczogSU9ic2VydmFibGVBcnJheTxLZXJuZWw+ID0gb2JzZXJ2YWJsZShbXSk7XG4gIEBvYnNlcnZhYmxlIGtlcm5lbE1hcHBpbmc6IEtlcm5lbE1hcHBpbmcgPSBuZXcgTWFwKCk7XG4gIEBvYnNlcnZhYmxlIHN0YXJ0aW5nS2VybmVsczogTWFwPHN0cmluZywgYm9vbGVhbj4gPSBuZXcgTWFwKCk7XG4gIEBvYnNlcnZhYmxlIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgQG9ic2VydmFibGUgZ3JhbW1hcjogP2F0b20kR3JhbW1hcjtcbiAgQG9ic2VydmFibGUgY29uZmlnTWFwcGluZzogTWFwPHN0cmluZywgP21peGVkPiA9IG5ldyBNYXAoKTtcbiAgZ2xvYmFsTW9kZTogYm9vbGVhbiA9IEJvb2xlYW4oYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4uZ2xvYmFsTW9kZVwiKSk7XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBrZXJuZWwoKTogP0tlcm5lbCB7XG4gICAgaWYgKHRoaXMuZ2xvYmFsTW9kZSkge1xuICAgICAgaWYgKCF0aGlzLmdyYW1tYXIpIHJldHVybiBudWxsO1xuICAgICAgY29uc3QgY3VycmVudFNjb3BlTmFtZSA9IHRoaXMuZ3JhbW1hci5zY29wZU5hbWU7XG4gICAgICByZXR1cm4gdGhpcy5ydW5uaW5nS2VybmVscy5maWx0ZXIoXG4gICAgICAgIGsgPT4gay5ncmFtbWFyLnNjb3BlTmFtZSA9PT0gY3VycmVudFNjb3BlTmFtZVxuICAgICAgKVswXTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZmlsZVBhdGgpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGtlcm5lbE9yTWFwID0gdGhpcy5rZXJuZWxNYXBwaW5nLmdldCh0aGlzLmZpbGVQYXRoKTtcbiAgICBpZiAoIWtlcm5lbE9yTWFwIHx8IGtlcm5lbE9yTWFwIGluc3RhbmNlb2YgS2VybmVsKSByZXR1cm4ga2VybmVsT3JNYXA7XG4gICAgaWYgKHRoaXMuZ3JhbW1hcikgcmV0dXJuIGtlcm5lbE9yTWFwLmdldCh0aGlzLmdyYW1tYXIubmFtZSk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGZpbGVQYXRoKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmVkaXRvciA/IHRoaXMuZWRpdG9yLmdldFBhdGgoKSA6IG51bGw7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGZpbGVQYXRocygpOiBBcnJheTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIGtleXModGhpcy5rZXJuZWxNYXBwaW5nKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbm90ZWJvb2soKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5lZGl0b3I7XG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBTaG91bGQgd2UgY29uc2lkZXIgc3RhcnRpbmcgb2ZmIHdpdGggYSBtb25vY2VsbE5vdGVib29rID9cbiAgICBsZXQgbm90ZWJvb2sgPSBjb21tdXRhYmxlLmVtcHR5Tm90ZWJvb2s7XG4gICAgY29uc3QgY2VsbFJhbmdlcyA9IGNvZGVNYW5hZ2VyLmdldENlbGxzKGVkaXRvcik7XG4gICAgXy5mb3JFYWNoKGNlbGxSYW5nZXMsIGNlbGwgPT4ge1xuICAgICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSBjZWxsO1xuICAgICAgbGV0IHNvdXJjZSA9IGNvZGVNYW5hZ2VyLmdldFRleHRJblJhbmdlKGVkaXRvciwgc3RhcnQsIGVuZCk7XG4gICAgICBzb3VyY2UgPSBzb3VyY2UgPyBzb3VyY2UgOiBcIlwiO1xuICAgICAgY29uc3QgbmV3Q2VsbCA9IGNvbW11dGFibGUuZW1wdHlDb2RlQ2VsbC5zZXQoXCJzb3VyY2VcIiwgc291cmNlKTtcbiAgICAgIG5vdGVib29rID0gY29tbXV0YWJsZS5hcHBlbmRDZWxsVG9Ob3RlYm9vayhub3RlYm9vaywgbmV3Q2VsbCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbW11dGFibGUudG9KUyhub3RlYm9vayk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHN0YXJ0S2VybmVsKGtlcm5lbERpc3BsYXlOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnN0YXJ0aW5nS2VybmVscy5zZXQoa2VybmVsRGlzcGxheU5hbWUsIHRydWUpO1xuICB9XG5cbiAgQGFjdGlvblxuICBuZXdLZXJuZWwoXG4gICAga2VybmVsOiBLZXJuZWwsXG4gICAgZmlsZVBhdGg6IHN0cmluZyxcbiAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICBncmFtbWFyOiBhdG9tJEdyYW1tYXJcbiAgKSB7XG4gICAgaWYgKGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIoZWRpdG9yLmdldEdyYW1tYXIoKSkpIHtcbiAgICAgIGlmICghdGhpcy5rZXJuZWxNYXBwaW5nLmhhcyhmaWxlUGF0aCkpIHtcbiAgICAgICAgdGhpcy5rZXJuZWxNYXBwaW5nLnNldChmaWxlUGF0aCwgbmV3IE1hcCgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG11bHRpTGFuZ3VhZ2VNYXAgPSB0aGlzLmtlcm5lbE1hcHBpbmcuZ2V0KGZpbGVQYXRoKTtcbiAgICAgIG11bHRpTGFuZ3VhZ2VNYXAuc2V0KGdyYW1tYXIubmFtZSwga2VybmVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXJuZWxNYXBwaW5nLnNldChmaWxlUGF0aCwga2VybmVsKTtcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnJ1bm5pbmdLZXJuZWxzLmZpbmRJbmRleChrID0+IGsgPT09IGtlcm5lbCk7XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgdGhpcy5ydW5uaW5nS2VybmVscy5wdXNoKGtlcm5lbCk7XG4gICAgfVxuICAgIC8vIGRlbGV0ZSBzdGFydGluZ0tlcm5lbCBzaW5jZSBzdG9yZS5rZXJuZWwgbm93IGluIHBsYWNlIHRvIHByZXZlbnQgZHVwbGljYXRlIGtlcm5lbFxuICAgIHRoaXMuc3RhcnRpbmdLZXJuZWxzLmRlbGV0ZShrZXJuZWwua2VybmVsU3BlYy5kaXNwbGF5X25hbWUpO1xuICB9XG5cbiAgQGFjdGlvblxuICBkZWxldGVLZXJuZWwoa2VybmVsOiBLZXJuZWwpIHtcbiAgICBjb25zdCBncmFtbWFyID0ga2VybmVsLmdyYW1tYXIubmFtZTtcbiAgICBjb25zdCBmaWxlcyA9IHRoaXMuZ2V0RmlsZXNGb3JLZXJuZWwoa2VybmVsKTtcblxuICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICBjb25zdCBrZXJuZWxPck1hcCA9IHRoaXMua2VybmVsTWFwcGluZy5nZXQoZmlsZSk7XG4gICAgICBpZiAoIWtlcm5lbE9yTWFwKSByZXR1cm47XG4gICAgICBpZiAoa2VybmVsT3JNYXAgaW5zdGFuY2VvZiBLZXJuZWwpIHtcbiAgICAgICAgdGhpcy5rZXJuZWxNYXBwaW5nLmRlbGV0ZShmaWxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtlcm5lbE9yTWFwLmRlbGV0ZShncmFtbWFyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucnVubmluZ0tlcm5lbHMucmVtb3ZlKGtlcm5lbCk7XG4gIH1cblxuICBnZXRGaWxlc0Zvcktlcm5lbChrZXJuZWw6IEtlcm5lbCkge1xuICAgIGNvbnN0IGdyYW1tYXIgPSBrZXJuZWwuZ3JhbW1hci5uYW1lO1xuICAgIHJldHVybiB0aGlzLmZpbGVQYXRocy5maWx0ZXIoZmlsZSA9PiB7XG4gICAgICBjb25zdCBrZXJuZWxPck1hcCA9IHRoaXMua2VybmVsTWFwcGluZy5nZXQoZmlsZSk7XG4gICAgICByZXR1cm4ga2VybmVsT3JNYXAgaW5zdGFuY2VvZiBLZXJuZWxcbiAgICAgICAgPyBrZXJuZWxPck1hcCA9PT0ga2VybmVsXG4gICAgICAgIDoga2VybmVsT3JNYXAuZ2V0KGdyYW1tYXIpID09PSBrZXJuZWw7XG4gICAgfSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLm1hcmtlcnMuY2xlYXIoKTtcbiAgICB0aGlzLnJ1bm5pbmdLZXJuZWxzLmZvckVhY2goa2VybmVsID0+IGtlcm5lbC5kZXN0cm95KCkpO1xuICAgIHRoaXMucnVubmluZ0tlcm5lbHMuY2xlYXIoKTtcbiAgICB0aGlzLmtlcm5lbE1hcHBpbmcuY2xlYXIoKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgdXBkYXRlRWRpdG9yKGVkaXRvcjogP2F0b20kVGV4dEVkaXRvcikge1xuICAgIHRoaXMuZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuc2V0R3JhbW1hcihlZGl0b3IpO1xuXG4gICAgaWYgKHRoaXMuZ2xvYmFsTW9kZSAmJiB0aGlzLmtlcm5lbCAmJiBlZGl0b3IpIHtcbiAgICAgIGNvbnN0IGZpbGVOYW1lID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmICghZmlsZU5hbWUpIHJldHVybjtcbiAgICAgIHRoaXMua2VybmVsTWFwcGluZy5zZXQoZmlsZU5hbWUsIHRoaXMua2VybmVsKTtcbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldEdyYW1tYXIoZWRpdG9yOiA/YXRvbSRUZXh0RWRpdG9yKSB7XG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHRoaXMuZ3JhbW1hciA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuXG4gICAgaWYgKGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIoZ3JhbW1hcikpIHtcbiAgICAgIGNvbnN0IGVtYmVkZGVkU2NvcGUgPSBnZXRFbWJlZGRlZFNjb3BlKFxuICAgICAgICBlZGl0b3IsXG4gICAgICAgIGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICApO1xuXG4gICAgICBpZiAoZW1iZWRkZWRTY29wZSkge1xuICAgICAgICBjb25zdCBzY29wZSA9IGVtYmVkZGVkU2NvcGUucmVwbGFjZShcIi5lbWJlZGRlZFwiLCBcIlwiKTtcbiAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ncmFtbWFyID0gZ3JhbW1hcjtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0Q29uZmlnVmFsdWUoa2V5UGF0aDogc3RyaW5nLCBuZXdWYWx1ZTogP21peGVkKSB7XG4gICAgaWYgKCFuZXdWYWx1ZSkge1xuICAgICAgbmV3VmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQoa2V5UGF0aCk7XG4gICAgfVxuICAgIHRoaXMuY29uZmlnTWFwcGluZy5zZXQoa2V5UGF0aCwgbmV3VmFsdWUpO1xuICB9XG5cbiAgZm9yY2VFZGl0b3JVcGRhdGUoKSB7XG4gICAgLy8gRm9yY2UgbW9ieCB0byByZWNhbGN1bGF0ZSBmaWxlUGF0aCAod2hpY2ggZGVwZW5kcyBvbiBlZGl0b3Igb2JzZXJ2YWJsZSlcblxuICAgIGNvbnN0IGN1cnJlbnRFZGl0b3IgPSB0aGlzLmVkaXRvcjtcbiAgICB0aGlzLnVwZGF0ZUVkaXRvcihudWxsKTtcbiAgICB0aGlzLnVwZGF0ZUVkaXRvcihjdXJyZW50RWRpdG9yKTtcbiAgfVxufVxuXG5jb25zdCBzdG9yZSA9IG5ldyBTdG9yZSgpO1xuZXhwb3J0IGRlZmF1bHQgc3RvcmU7XG5cbi8vIEZvciBkZWJ1Z2dpbmdcbndpbmRvdy5oeWRyb2dlbl9zdG9yZSA9IHN0b3JlO1xuIl19