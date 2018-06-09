Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _mobx = require("mobx");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _kernelPicker = require("./kernel-picker");

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _wsKernelPicker = require("./ws-kernel-picker");

var _wsKernelPicker2 = _interopRequireDefault(_wsKernelPicker);

var _existingKernelPicker = require("./existing-kernel-picker");

var _existingKernelPicker2 = _interopRequireDefault(_existingKernelPicker);

var _signalListView = require("./signal-list-view");

var _signalListView2 = _interopRequireDefault(_signalListView);

var _codeManager = require("./code-manager");

var codeManager = _interopRequireWildcard(_codeManager);

var _componentsInspector = require("./components/inspector");

var _componentsInspector2 = _interopRequireDefault(_componentsInspector);

var _componentsResultView = require("./components/result-view");

var _componentsResultView2 = _interopRequireDefault(_componentsResultView);

var _componentsStatusBar = require("./components/status-bar");

var _componentsStatusBar2 = _interopRequireDefault(_componentsStatusBar);

var _panesInspector = require("./panes/inspector");

var _panesInspector2 = _interopRequireDefault(_panesInspector);

var _panesWatches = require("./panes/watches");

var _panesWatches2 = _interopRequireDefault(_panesWatches);

var _panesOutputArea = require("./panes/output-area");

var _panesOutputArea2 = _interopRequireDefault(_panesOutputArea);

var _panesKernelMonitor = require("./panes/kernel-monitor");

var _panesKernelMonitor2 = _interopRequireDefault(_panesKernelMonitor);

var _commands = require("./commands");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _storeOutput = require("./store/output");

var _storeOutput2 = _interopRequireDefault(_storeOutput);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _kernelManager = require("./kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _zmqKernel = require("./zmq-kernel");

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _kernel = require("./kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var _autocompleteProvider = require("./autocomplete-provider");

var _autocompleteProvider2 = _interopRequireDefault(_autocompleteProvider);

var _pluginApiHydrogenProvider = require("./plugin-api/hydrogen-provider");

var _pluginApiHydrogenProvider2 = _interopRequireDefault(_pluginApiHydrogenProvider);

var _utils = require("./utils");

var _exportNotebook = require("./export-notebook");

var _exportNotebook2 = _interopRequireDefault(_exportNotebook);

var Hydrogen = {
  config: _config2["default"].schema,

  activate: function activate() {
    var _this = this;

    this.emitter = new _atom.Emitter();

    var skipLanguageMappingsChange = false;
    _store2["default"].subscriptions.add(atom.config.onDidChange("Hydrogen.languageMappings", function (_ref) {
      var newValue = _ref.newValue;
      var oldValue = _ref.oldValue;

      if (skipLanguageMappingsChange) {
        skipLanguageMappingsChange = false;
        return;
      }

      if (_store2["default"].runningKernels.length != 0) {
        skipLanguageMappingsChange = true;

        atom.config.set("Hydrogen.languageMappings", oldValue);

        atom.notifications.addError("Hydrogen", {
          description: "`languageMappings` cannot be updated while kernels are running",
          dismissable: false
        });
      }
    }));

    _store2["default"].subscriptions.add(
    // enable/disable mobx-react-devtools logging
    atom.config.onDidChange("Hydrogen.debug", function (_ref2) {
      var newValue = _ref2.newValue;
      return (0, _utils.renderDevTools)(newValue);
    }));

    _store2["default"].subscriptions.add(atom.config.observe("Hydrogen.statusBarDisable", function (newValue) {
      _store2["default"].setConfigValue("Hydrogen.statusBarDisable", Boolean(newValue));
    }));

    _store2["default"].subscriptions.add(atom.commands.add("atom-text-editor:not([mini])", {
      "hydrogen:run": function hydrogenRun() {
        return _this.run();
      },
      "hydrogen:run-all": function hydrogenRunAll() {
        return _this.runAll();
      },
      "hydrogen:run-all-above": function hydrogenRunAllAbove() {
        return _this.runAllAbove();
      },
      "hydrogen:run-and-move-down": function hydrogenRunAndMoveDown() {
        return _this.run(true);
      },
      "hydrogen:run-cell": function hydrogenRunCell() {
        return _this.runCell();
      },
      "hydrogen:run-cell-and-move-down": function hydrogenRunCellAndMoveDown() {
        return _this.runCell(true);
      },
      "hydrogen:toggle-watches": function hydrogenToggleWatches() {
        return atom.workspace.toggle(_utils.WATCHES_URI);
      },
      "hydrogen:toggle-output-area": function hydrogenToggleOutputArea() {
        return atom.workspace.toggle(_utils.OUTPUT_AREA_URI);
      },
      "hydrogen:toggle-kernel-monitor": function hydrogenToggleKernelMonitor() {
        return atom.workspace.toggle(_utils.KERNEL_MONITOR_URI);
      },
      "hydrogen:start-local-kernel": function hydrogenStartLocalKernel() {
        return _this.startZMQKernel();
      },
      "hydrogen:connect-to-remote-kernel": function hydrogenConnectToRemoteKernel() {
        return _this.connectToWSKernel();
      },
      "hydrogen:connect-to-existing-kernel": function hydrogenConnectToExistingKernel() {
        return _this.connectToExistingKernel();
      },
      "hydrogen:add-watch": function hydrogenAddWatch() {
        if (_store2["default"].kernel) {
          _store2["default"].kernel.watchesStore.addWatchFromEditor(_store2["default"].editor);
          (0, _utils.openOrShowDock)(_utils.WATCHES_URI);
        }
      },
      "hydrogen:remove-watch": function hydrogenRemoveWatch() {
        if (_store2["default"].kernel) {
          _store2["default"].kernel.watchesStore.removeWatch();
          (0, _utils.openOrShowDock)(_utils.WATCHES_URI);
        }
      },
      "hydrogen:update-kernels": function hydrogenUpdateKernels() {
        return _kernelManager2["default"].updateKernelSpecs();
      },
      "hydrogen:toggle-inspector": function hydrogenToggleInspector() {
        return (0, _commands.toggleInspector)(_store2["default"]);
      },
      "hydrogen:interrupt-kernel": function hydrogenInterruptKernel() {
        return _this.handleKernelCommand({ command: "interrupt-kernel" });
      },
      "hydrogen:restart-kernel": function hydrogenRestartKernel() {
        return _this.handleKernelCommand({ command: "restart-kernel" });
      },
      "hydrogen:restart-kernel-and-re-evaluate-bubbles": function hydrogenRestartKernelAndReEvaluateBubbles() {
        return _this.restartKernelAndReEvaluateBubbles();
      },
      "hydrogen:shutdown-kernel": function hydrogenShutdownKernel() {
        return _this.handleKernelCommand({ command: "shutdown-kernel" });
      },
      "hydrogen:toggle-bubble": function hydrogenToggleBubble() {
        return _this.toggleBubble();
      },
      "hydrogen:export-notebook": function hydrogenExportNotebook() {
        return (0, _exportNotebook2["default"])();
      }
    }));

    _store2["default"].subscriptions.add(atom.commands.add("atom-workspace", {
      "hydrogen:clear-results": function hydrogenClearResults() {
        _store2["default"].markers.clear();
        if (!_store2["default"].kernel) return;
        _store2["default"].kernel.outputStore.clear();
      }
    }));

    if (atom.inDevMode()) {
      _store2["default"].subscriptions.add(atom.commands.add("atom-workspace", {
        "hydrogen:hot-reload-package": function hydrogenHotReloadPackage() {
          return (0, _utils.hotReloadPackage)();
        }
      }));
    }

    _store2["default"].subscriptions.add(atom.workspace.observeActiveTextEditor(function (editor) {
      _store2["default"].updateEditor(editor);
    }));

    _store2["default"].subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      var editorSubscriptions = new _atom.CompositeDisposable();
      editorSubscriptions.add(editor.onDidChangeGrammar(function () {
        _store2["default"].setGrammar(editor);
      }));

      if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
        editorSubscriptions.add(editor.onDidChangeCursorPosition(_lodash2["default"].debounce(function () {
          _store2["default"].setGrammar(editor);
        }, 75)));
      }

      editorSubscriptions.add(editor.onDidDestroy(function () {
        editorSubscriptions.dispose();
      }));

      editorSubscriptions.add(editor.onDidChangeTitle(function (newTitle) {
        return _store2["default"].forceEditorUpdate();
      }));

      _store2["default"].subscriptions.add(editorSubscriptions);
    }));

    this.hydrogenProvider = null;

    _store2["default"].subscriptions.add(atom.workspace.addOpener(function (uri) {
      switch (uri) {
        case _utils.INSPECTOR_URI:
          return new _panesInspector2["default"](_store2["default"]);
        case _utils.WATCHES_URI:
          return new _panesWatches2["default"](_store2["default"]);
        case _utils.OUTPUT_AREA_URI:
          return new _panesOutputArea2["default"](_store2["default"]);
        case _utils.KERNEL_MONITOR_URI:
          return new _panesKernelMonitor2["default"](_store2["default"]);
      }
    }));

    _store2["default"].subscriptions.add(
    // Destroy any Panes when the package is deactivated.
    new _atom.Disposable(function () {
      atom.workspace.getPaneItems().forEach(function (item) {
        if (item instanceof _panesInspector2["default"] || item instanceof _panesWatches2["default"] || item instanceof _panesOutputArea2["default"] || item instanceof _panesKernelMonitor2["default"]) {
          item.destroy();
        }
      });
    }));

    (0, _utils.renderDevTools)(atom.config.get("Hydrogen.debug") === true);

    (0, _mobx.autorun)(function () {
      _this.emitter.emit("did-change-kernel", _store2["default"].kernel);
    });
  },

  deactivate: function deactivate() {
    _store2["default"].dispose();
  },

  provideHydrogen: function provideHydrogen() {
    if (!this.hydrogenProvider) {
      this.hydrogenProvider = new _pluginApiHydrogenProvider2["default"](this);
    }

    return this.hydrogenProvider;
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    var statusBarElement = document.createElement("div");
    statusBarElement.className = "inline-block";

    statusBar.addLeftTile({
      item: statusBarElement,
      priority: 100
    });

    var onClick = this.showKernelCommands.bind(this);

    (0, _utils.reactFactory)(_react2["default"].createElement(_componentsStatusBar2["default"], { store: _store2["default"], onClick: onClick }), statusBarElement);

    // We should return a disposable here but Atom fails while calling .destroy()
    // return new Disposable(statusBarTile.destroy);
  },

  provide: function provide() {
    if (atom.config.get("Hydrogen.autocomplete") === true) {
      return (0, _autocompleteProvider2["default"])();
    }
    return null;
  },

  showKernelCommands: function showKernelCommands() {
    var _this2 = this;

    if (!this.signalListView) {
      this.signalListView = new _signalListView2["default"]();
      this.signalListView.onConfirmed = function (kernelCommand) {
        return _this2.handleKernelCommand(kernelCommand);
      };
    }
    this.signalListView.toggle();
  },

  connectToExistingKernel: function connectToExistingKernel() {
    if (!this.existingKernelPicker) {
      this.existingKernelPicker = new _existingKernelPicker2["default"]();
    }
    this.existingKernelPicker.toggle();
  },

  handleKernelCommand: function handleKernelCommand(_ref3) {
    var command = _ref3.command;
    var payload = _ref3.payload;
    return (function () {
      (0, _utils.log)("handleKernelCommand:", arguments);

      var kernel = _store2["default"].kernel;
      var grammar = _store2["default"].grammar;

      if (!grammar) {
        atom.notifications.addError("Undefined grammar");
        return;
      }

      if (!kernel) {
        var message = "No running kernel for grammar `" + grammar.name + "` found";
        atom.notifications.addError(message);
        return;
      }

      if (command === "interrupt-kernel") {
        kernel.interrupt();
      } else if (command === "restart-kernel") {
        kernel.restart();
      } else if (command === "shutdown-kernel") {
        _store2["default"].markers.clear();
        // Note that destroy alone does not shut down a WSKernel
        kernel.shutdown();
        kernel.destroy();
      } else if (command === "rename-kernel" && kernel.transport instanceof _wsKernel2["default"]) {
        kernel.transport.promptRename();
      } else if (command === "disconnect-kernel") {
        _store2["default"].markers.clear();
        kernel.destroy();
      }
    }).apply(this, arguments);
  },

  createResultBubble: function createResultBubble(editor, code, row) {
    var _this3 = this;

    var grammar = _store2["default"].grammar;
    var filePath = _store2["default"].filePath;
    var kernel = _store2["default"].kernel;

    if (!filePath || !grammar) {
      return atom.notifications.addError("Your file must be saved in order to start a kernel");
    }

    if (kernel) {
      this._createResultBubble(editor, kernel, code, row);
      return;
    }

    _kernelManager2["default"].startKernelFor(grammar, editor, filePath, function (kernel) {
      _this3._createResultBubble(editor, kernel, code, row);
    });
  },

  _createResultBubble: function _createResultBubble(editor, kernel, code, row) {
    if (atom.workspace.getActivePaneItem() instanceof _panesWatches2["default"]) {
      kernel.watchesStore.run();
      return;
    }
    var globalOutputStore = atom.config.get("Hydrogen.outputAreaDefault") || atom.workspace.getPaneItems().find(function (item) {
      return item instanceof _panesOutputArea2["default"];
    }) ? kernel.outputStore : null;

    if (globalOutputStore) (0, _utils.openOrShowDock)(_utils.OUTPUT_AREA_URI);

    var _ref4 = new _componentsResultView2["default"](_store2["default"].markers, kernel, editor, row, !globalOutputStore);

    var outputStore = _ref4.outputStore;

    kernel.execute(code, function (result) {
      outputStore.appendOutput(result);
      if (globalOutputStore) globalOutputStore.appendOutput(result);
    });
  },

  restartKernelAndReEvaluateBubbles: function restartKernelAndReEvaluateBubbles() {
    var _this4 = this;

    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var markers = _store2["default"].markers;

    var breakpoints = [];
    markers.markers.forEach(function (bubble) {
      breakpoints.push(bubble.marker.getBufferRange().start);
    });
    _store2["default"].markers.clear();

    if (!editor || !kernel) {
      this.runAll(breakpoints);
    } else {
      kernel.restart(function () {
        return _this4.runAll(breakpoints);
      });
    }
  },

  toggleBubble: function toggleBubble() {
    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var markers = _store2["default"].markers;

    if (!editor) return;

    var _editor$getLastSelection$getBufferRowRange = editor.getLastSelection().getBufferRowRange();

    var _editor$getLastSelection$getBufferRowRange2 = _slicedToArray(_editor$getLastSelection$getBufferRowRange, 2);

    var startRow = _editor$getLastSelection$getBufferRowRange2[0];
    var endRow = _editor$getLastSelection$getBufferRowRange2[1];

    for (var row = startRow; row <= endRow; row++) {
      var destroyed = markers.clearOnRow(row);

      if (!destroyed) {
        var _ref5 = new _componentsResultView2["default"](markers, kernel, editor, row, true);

        var outputStore = _ref5.outputStore;

        outputStore.status = "empty";
      }
    }
  },

  run: function run() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var editor = _store2["default"].editor;
    if (!editor) return;
    var codeBlock = codeManager.findCodeBlock(editor);
    if (!codeBlock) {
      return;
    }

    var _codeBlock = _slicedToArray(codeBlock, 2);

    var code = _codeBlock[0];
    var row = _codeBlock[1];

    if (code) {
      if (moveDown === true) {
        codeManager.moveDown(editor, row);
      }
      this.createResultBubble(editor, code, row);
    }
  },

  runAll: function runAll(breakpoints) {
    var _this5 = this;

    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var grammar = _store2["default"].grammar;
    var filePath = _store2["default"].filePath;

    if (!editor || !grammar || !filePath) return;
    if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
      atom.notifications.addError('"Run All" is not supported for this file type!');
      return;
    }

    if (editor && kernel) {
      this._runAll(editor, kernel, breakpoints);
      return;
    }

    _kernelManager2["default"].startKernelFor(grammar, editor, filePath, function (kernel) {
      _this5._runAll(editor, kernel, breakpoints);
    });
  },

  _runAll: function _runAll(editor, kernel, breakpoints) {
    var _this6 = this,
        _arguments = arguments;

    var cells = codeManager.getCells(editor, breakpoints);
    _lodash2["default"].forEach(cells, function (_ref6) {
      var start = _ref6.start;
      var end = _ref6.end;
      return (function () {
        var code = codeManager.getTextInRange(editor, start, end);
        var endRow = codeManager.escapeBlankRows(editor, start.row, end.row);
        this._createResultBubble(editor, kernel, code, endRow);
      }).apply(_this6, _arguments);
    });
  },

  runAllAbove: function runAllAbove() {
    var editor = _store2["default"].editor; // to make flow happy
    if (!editor) return;
    if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
      atom.notifications.addError('"Run All Above" is not supported for this file type!');
      return;
    }

    var cursor = editor.getLastCursor();
    var row = codeManager.escapeBlankRows(editor, 0, cursor.getBufferRow());
    var code = codeManager.getRows(editor, 0, row);

    if (code) {
      this.createResultBubble(editor, code, row);
    }
  },

  runCell: function runCell() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var editor = _store2["default"].editor;
    if (!editor) return;

    var _codeManager$getCurrentCell = codeManager.getCurrentCell(editor);

    var start = _codeManager$getCurrentCell.start;
    var end = _codeManager$getCurrentCell.end;

    var code = codeManager.getTextInRange(editor, start, end);
    var endRow = codeManager.escapeBlankRows(editor, start.row, end.row);

    if (code) {
      if (moveDown === true) {
        codeManager.moveDown(editor, endRow);
      }
      this.createResultBubble(editor, code, endRow);
    }
  },

  startZMQKernel: function startZMQKernel() {
    var _this7 = this;

    _kernelManager2["default"].getAllKernelSpecsForGrammar(_store2["default"].grammar).then(function (kernelSpecs) {
      if (_this7.kernelPicker) {
        _this7.kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        _this7.kernelPicker = new _kernelPicker2["default"](kernelSpecs);

        _this7.kernelPicker.onConfirmed = function (kernelSpec) {
          var editor = _store2["default"].editor;
          var grammar = _store2["default"].grammar;
          var filePath = _store2["default"].filePath;

          if (!editor || !grammar || !filePath) return;
          _store2["default"].markers.clear();

          _kernelManager2["default"].startKernel(kernelSpec, grammar, editor, filePath);
        };
      }

      _this7.kernelPicker.toggle();
    });
  },

  connectToWSKernel: function connectToWSKernel() {
    if (!this.wsKernelPicker) {
      this.wsKernelPicker = new _wsKernelPicker2["default"](function (transport) {
        var kernel = new _kernel2["default"](transport);
        _store2["default"].markers.clear();
        var editor = _store2["default"].editor;
        var grammar = _store2["default"].grammar;
        var filePath = _store2["default"].filePath;

        if (!editor || !grammar || !filePath) return;

        if (kernel.transport instanceof _zmqKernel2["default"]) kernel.destroy();

        _store2["default"].newKernel(kernel, filePath, editor, grammar);
      });
    }

    this.wsKernelPicker.toggle(function (kernelSpec) {
      return (0, _utils.kernelSpecProvidesGrammar)(kernelSpec, _store2["default"].grammar);
    });
  }
};

exports["default"] = Hydrogen;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBUU8sTUFBTTs7c0JBRUMsUUFBUTs7OztvQkFDRSxNQUFNOztxQkFDWixPQUFPOzs7OzRCQUVBLGlCQUFpQjs7Ozs4QkFDZixvQkFBb0I7Ozs7b0NBQ2QsMEJBQTBCOzs7OzhCQUNoQyxvQkFBb0I7Ozs7MkJBQ2xCLGdCQUFnQjs7SUFBakMsV0FBVzs7bUNBRUQsd0JBQXdCOzs7O29DQUN2QiwwQkFBMEI7Ozs7bUNBQzNCLHlCQUF5Qjs7Ozs4QkFFckIsbUJBQW1COzs7OzRCQUNyQixpQkFBaUI7Ozs7K0JBQ2xCLHFCQUFxQjs7OztrQ0FDZCx3QkFBd0I7Ozs7d0JBRXRCLFlBQVk7O3FCQUUxQixTQUFTOzs7OzJCQUNILGdCQUFnQjs7OztzQkFFckIsVUFBVTs7Ozs2QkFDSCxrQkFBa0I7Ozs7eUJBQ3RCLGNBQWM7Ozs7d0JBQ2YsYUFBYTs7OztzQkFDZixVQUFVOzs7O29DQUNJLHlCQUF5Qjs7Ozt5Q0FDN0IsZ0NBQWdDOzs7O3FCQWN0RCxTQUFTOzs4QkFFVyxtQkFBbUI7Ozs7QUFFOUMsSUFBTSxRQUFRLEdBQUc7QUFDZixRQUFNLEVBQUUsb0JBQU8sTUFBTTs7QUFFckIsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUM7O0FBRTdCLFFBQUksMEJBQTBCLEdBQUcsS0FBSyxDQUFDO0FBQ3ZDLHVCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUNyQiwyQkFBMkIsRUFDM0IsVUFBQyxJQUFzQixFQUFLO1VBQXpCLFFBQVEsR0FBVixJQUFzQixDQUFwQixRQUFRO1VBQUUsUUFBUSxHQUFwQixJQUFzQixDQUFWLFFBQVE7O0FBQ25CLFVBQUksMEJBQTBCLEVBQUU7QUFDOUIsa0NBQTBCLEdBQUcsS0FBSyxDQUFDO0FBQ25DLGVBQU87T0FDUjs7QUFFRCxVQUFJLG1CQUFNLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ3BDLGtDQUEwQixHQUFHLElBQUksQ0FBQzs7QUFFbEMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRXZELFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRTtBQUN0QyxxQkFBVyxFQUNULGdFQUFnRTtBQUNsRSxxQkFBVyxFQUFFLEtBQUs7U0FDbkIsQ0FBQyxDQUFDO09BQ0o7S0FDRixDQUNGLENBQ0YsQ0FBQzs7QUFFRix1QkFBTSxhQUFhLENBQUMsR0FBRzs7QUFFckIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsVUFBQyxLQUFZO1VBQVYsUUFBUSxHQUFWLEtBQVksQ0FBVixRQUFRO2FBQ25ELDJCQUFlLFFBQVEsQ0FBQztLQUFBLENBQ3pCLENBQ0YsQ0FBQzs7QUFFRix1QkFBTSxhQUFhLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxVQUFBLFFBQVEsRUFBSTtBQUMzRCx5QkFBTSxjQUFjLENBQUMsMkJBQTJCLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDdEUsQ0FBQyxDQUNILENBQUM7O0FBRUYsdUJBQU0sYUFBYSxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsOEJBQThCLEVBQUU7QUFDaEQsb0JBQWMsRUFBRTtlQUFNLE1BQUssR0FBRyxFQUFFO09BQUE7QUFDaEMsd0JBQWtCLEVBQUU7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBO0FBQ3ZDLDhCQUF3QixFQUFFO2VBQU0sTUFBSyxXQUFXLEVBQUU7T0FBQTtBQUNsRCxrQ0FBNEIsRUFBRTtlQUFNLE1BQUssR0FBRyxDQUFDLElBQUksQ0FBQztPQUFBO0FBQ2xELHlCQUFtQixFQUFFO2VBQU0sTUFBSyxPQUFPLEVBQUU7T0FBQTtBQUN6Qyx1Q0FBaUMsRUFBRTtlQUFNLE1BQUssT0FBTyxDQUFDLElBQUksQ0FBQztPQUFBO0FBQzNELCtCQUF5QixFQUFFO2VBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLG9CQUFhO09BQUE7QUFDbkUsbUNBQTZCLEVBQUU7ZUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLHdCQUFpQjtPQUFBO0FBQ3hDLHNDQUFnQyxFQUFFO2VBQ2hDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSwyQkFBb0I7T0FBQTtBQUMzQyxtQ0FBNkIsRUFBRTtlQUFNLE1BQUssY0FBYyxFQUFFO09BQUE7QUFDMUQseUNBQW1DLEVBQUU7ZUFBTSxNQUFLLGlCQUFpQixFQUFFO09BQUE7QUFDbkUsMkNBQXFDLEVBQUU7ZUFDckMsTUFBSyx1QkFBdUIsRUFBRTtPQUFBO0FBQ2hDLDBCQUFvQixFQUFFLDRCQUFNO0FBQzFCLFlBQUksbUJBQU0sTUFBTSxFQUFFO0FBQ2hCLDZCQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsbUJBQU0sTUFBTSxDQUFDLENBQUM7QUFDM0Qsd0RBQTJCLENBQUM7U0FDN0I7T0FDRjtBQUNELDZCQUF1QixFQUFFLCtCQUFNO0FBQzdCLFlBQUksbUJBQU0sTUFBTSxFQUFFO0FBQ2hCLDZCQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDeEMsd0RBQTJCLENBQUM7U0FDN0I7T0FDRjtBQUNELCtCQUF5QixFQUFFO2VBQU0sMkJBQWMsaUJBQWlCLEVBQUU7T0FBQTtBQUNsRSxpQ0FBMkIsRUFBRTtlQUFNLGtEQUFzQjtPQUFBO0FBQ3pELGlDQUEyQixFQUFFO2VBQzNCLE1BQUssbUJBQW1CLENBQUMsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztPQUFBO0FBQzNELCtCQUF5QixFQUFFO2VBQ3pCLE1BQUssbUJBQW1CLENBQUMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztPQUFBO0FBQ3pELHVEQUFpRCxFQUFFO2VBQ2pELE1BQUssaUNBQWlDLEVBQUU7T0FBQTtBQUMxQyxnQ0FBMEIsRUFBRTtlQUMxQixNQUFLLG1CQUFtQixDQUFDLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUM7T0FBQTtBQUMxRCw4QkFBd0IsRUFBRTtlQUFNLE1BQUssWUFBWSxFQUFFO09BQUE7QUFDbkQsZ0NBQTBCLEVBQUU7ZUFBTSxrQ0FBZ0I7T0FBQTtLQUNuRCxDQUFDLENBQ0gsQ0FBQzs7QUFFRix1QkFBTSxhQUFhLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyw4QkFBd0IsRUFBRSxnQ0FBTTtBQUM5QiwyQkFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEIsWUFBSSxDQUFDLG1CQUFNLE1BQU0sRUFBRSxPQUFPO0FBQzFCLDJCQUFNLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDbEM7S0FDRixDQUFDLENBQ0gsQ0FBQzs7QUFFRixRQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUNwQix5QkFBTSxhQUFhLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyxxQ0FBNkIsRUFBRTtpQkFBTSw4QkFBa0I7U0FBQTtPQUN4RCxDQUFDLENBQ0gsQ0FBQztLQUNIOztBQUVELHVCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDL0MseUJBQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzVCLENBQUMsQ0FDSCxDQUFDOztBQUVGLHVCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDMUMsVUFBTSxtQkFBbUIsR0FBRywrQkFBeUIsQ0FBQztBQUN0RCx5QkFBbUIsQ0FBQyxHQUFHLENBQ3JCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxZQUFNO0FBQzlCLDJCQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMxQixDQUFDLENBQ0gsQ0FBQzs7QUFFRixVQUFJLG1DQUF1QixNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRTtBQUMvQywyQkFBbUIsQ0FBQyxHQUFHLENBQ3JCLE1BQU0sQ0FBQyx5QkFBeUIsQ0FDOUIsb0JBQUUsUUFBUSxDQUFDLFlBQU07QUFDZiw2QkFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUIsRUFBRSxFQUFFLENBQUMsQ0FDUCxDQUNGLENBQUM7T0FDSDs7QUFFRCx5QkFBbUIsQ0FBQyxHQUFHLENBQ3JCLE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUN4QiwyQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUMvQixDQUFDLENBQ0gsQ0FBQzs7QUFFRix5QkFBbUIsQ0FBQyxHQUFHLENBQ3JCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFBLFFBQVE7ZUFBSSxtQkFBTSxpQkFBaUIsRUFBRTtPQUFBLENBQUMsQ0FDL0QsQ0FBQzs7QUFFRix5QkFBTSxhQUFhLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7S0FDOUMsQ0FBQyxDQUNILENBQUM7O0FBRUYsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQzs7QUFFN0IsdUJBQU0sYUFBYSxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDOUIsY0FBUSxHQUFHO0FBQ1Q7QUFDRSxpQkFBTyxtREFBd0IsQ0FBQztBQUFBLEFBQ2xDO0FBQ0UsaUJBQU8saURBQXNCLENBQUM7QUFBQSxBQUNoQztBQUNFLGlCQUFPLG9EQUFxQixDQUFDO0FBQUEsQUFDL0I7QUFDRSxpQkFBTyx1REFBNEIsQ0FBQztBQUFBLE9BQ3ZDO0tBQ0YsQ0FBQyxDQUNILENBQUM7O0FBRUYsdUJBQU0sYUFBYSxDQUFDLEdBQUc7O0FBRXJCLHlCQUFlLFlBQU07QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDNUMsWUFDRSxJQUFJLHVDQUF5QixJQUM3QixJQUFJLHFDQUF1QixJQUMzQixJQUFJLHdDQUFzQixJQUMxQixJQUFJLDJDQUE2QixFQUNqQztBQUNBLGNBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtPQUNGLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FDSCxDQUFDOztBQUVGLCtCQUFlLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7O0FBRTNELHVCQUFRLFlBQU07QUFDWixZQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsbUJBQU0sTUFBTSxDQUFDLENBQUM7S0FDdEQsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsdUJBQU0sT0FBTyxFQUFFLENBQUM7R0FDakI7O0FBRUQsaUJBQWUsRUFBQSwyQkFBRztBQUNoQixRQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQzFCLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRywyQ0FBcUIsSUFBSSxDQUFDLENBQUM7S0FDcEQ7O0FBRUQsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7R0FDOUI7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsU0FBeUIsRUFBRTtBQUMxQyxRQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkQsb0JBQWdCLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQzs7QUFFNUMsYUFBUyxDQUFDLFdBQVcsQ0FBQztBQUNwQixVQUFJLEVBQUUsZ0JBQWdCO0FBQ3RCLGNBQVEsRUFBRSxHQUFHO0tBQ2QsQ0FBQyxDQUFDOztBQUVILFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRW5ELDZCQUNFLHFFQUFXLEtBQUssb0JBQVEsRUFBQyxPQUFPLEVBQUUsT0FBTyxBQUFDLEdBQUcsRUFDN0MsZ0JBQWdCLENBQ2pCLENBQUM7Ozs7R0FJSDs7QUFFRCxTQUFPLEVBQUEsbUJBQUc7QUFDUixRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLEtBQUssSUFBSSxFQUFFO0FBQ3JELGFBQU8sd0NBQXNCLENBQUM7S0FDL0I7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELG9CQUFrQixFQUFBLDhCQUFHOzs7QUFDbkIsUUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDeEIsVUFBSSxDQUFDLGNBQWMsR0FBRyxpQ0FBb0IsQ0FBQztBQUMzQyxVQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsR0FBRyxVQUFDLGFBQWE7ZUFDOUMsT0FBSyxtQkFBbUIsQ0FBQyxhQUFhLENBQUM7T0FBQSxDQUFDO0tBQzNDO0FBQ0QsUUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUM5Qjs7QUFFRCx5QkFBdUIsRUFBQSxtQ0FBRztBQUN4QixRQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO0FBQzlCLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyx1Q0FBMEIsQ0FBQztLQUN4RDtBQUNELFFBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNwQzs7QUFFRCxxQkFBbUIsRUFBQSw2QkFBQyxLQU1uQjtRQUxDLE9BQU8sR0FEVyxLQU1uQixDQUxDLE9BQU87UUFDUCxPQUFPLEdBRlcsS0FNbkIsQ0FKQyxPQUFPO3dCQUlOO0FBQ0Qsc0JBQUksc0JBQXNCLEVBQUUsU0FBUyxDQUFDLENBQUM7O1VBRS9CLE1BQU0sc0JBQU4sTUFBTTtVQUFFLE9BQU8sc0JBQVAsT0FBTzs7QUFFdkIsVUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDakQsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxZQUFNLE9BQU8sdUNBQXNDLE9BQU8sQ0FBQyxJQUFJLFlBQVUsQ0FBQztBQUMxRSxZQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyQyxlQUFPO09BQ1I7O0FBRUQsVUFBSSxPQUFPLEtBQUssa0JBQWtCLEVBQUU7QUFDbEMsY0FBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO09BQ3BCLE1BQU0sSUFBSSxPQUFPLEtBQUssZ0JBQWdCLEVBQUU7QUFDdkMsY0FBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ2xCLE1BQU0sSUFBSSxPQUFPLEtBQUssaUJBQWlCLEVBQUU7QUFDeEMsMkJBQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV0QixjQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEIsY0FBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ2xCLE1BQU0sSUFDTCxPQUFPLEtBQUssZUFBZSxJQUMzQixNQUFNLENBQUMsU0FBUyxpQ0FBb0IsRUFDcEM7QUFDQSxjQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO09BQ2pDLE1BQU0sSUFBSSxPQUFPLEtBQUssbUJBQW1CLEVBQUU7QUFDMUMsMkJBQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCLGNBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNsQjtLQUNGO0dBQUE7O0FBRUQsb0JBQWtCLEVBQUEsNEJBQUMsTUFBdUIsRUFBRSxJQUFZLEVBQUUsR0FBVyxFQUFFOzs7UUFDN0QsT0FBTyxzQkFBUCxPQUFPO1FBQUUsUUFBUSxzQkFBUixRQUFRO1FBQUUsTUFBTSxzQkFBTixNQUFNOztBQUVqQyxRQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ2hDLG9EQUFvRCxDQUNyRCxDQUFDO0tBQ0g7O0FBRUQsUUFBSSxNQUFNLEVBQUU7QUFDVixVQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEQsYUFBTztLQUNSOztBQUVELCtCQUFjLGNBQWMsQ0FDMUIsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsVUFBQyxNQUFNLEVBQWdCO0FBQ3JCLGFBQUssbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckQsQ0FDRixDQUFDO0dBQ0g7O0FBRUQscUJBQW1CLEVBQUEsNkJBQ2pCLE1BQXVCLEVBQ3ZCLE1BQWMsRUFDZCxJQUFZLEVBQ1osR0FBVyxFQUNYO0FBQ0EsUUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLHFDQUF1QixFQUFFO0FBQzdELFlBQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsYUFBTztLQUNSO0FBQ0QsUUFBTSxpQkFBaUIsR0FDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsSUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSx3Q0FBc0I7S0FBQSxDQUFDLEdBQ2xFLE1BQU0sQ0FBQyxXQUFXLEdBQ2xCLElBQUksQ0FBQzs7QUFFWCxRQUFJLGlCQUFpQixFQUFFLGtEQUErQixDQUFDOztnQkFFL0Isc0NBQ3RCLG1CQUFNLE9BQU8sRUFDYixNQUFNLEVBQ04sTUFBTSxFQUNOLEdBQUcsRUFDSCxDQUFDLGlCQUFpQixDQUNuQjs7UUFOTyxXQUFXLFNBQVgsV0FBVzs7QUFRbkIsVUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBQSxNQUFNLEVBQUk7QUFDN0IsaUJBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsVUFBSSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDL0QsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsbUNBQWlDLEVBQUEsNkNBQUc7OztRQUMxQixNQUFNLHNCQUFOLE1BQU07UUFBRSxNQUFNLHNCQUFOLE1BQU07UUFBRSxPQUFPLHNCQUFQLE9BQU87O0FBRS9CLFFBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixXQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBaUI7QUFDOUMsaUJBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN4RCxDQUFDLENBQUM7QUFDSCx1QkFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDdEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMxQixNQUFNO0FBQ0wsWUFBTSxDQUFDLE9BQU8sQ0FBQztlQUFNLE9BQUssTUFBTSxDQUFDLFdBQVcsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUNoRDtHQUNGOztBQUVELGNBQVksRUFBQSx3QkFBRztRQUNMLE1BQU0sc0JBQU4sTUFBTTtRQUFFLE1BQU0sc0JBQU4sTUFBTTtRQUFFLE9BQU8sc0JBQVAsT0FBTzs7QUFDL0IsUUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPOztxREFDTyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTs7OztRQUFqRSxRQUFRO1FBQUUsTUFBTTs7QUFFdkIsU0FBSyxJQUFJLEdBQUcsR0FBRyxRQUFRLEVBQUUsR0FBRyxJQUFJLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtBQUM3QyxVQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUUxQyxVQUFJLENBQUMsU0FBUyxFQUFFO29CQUNVLHNDQUN0QixPQUFPLEVBQ1AsTUFBTSxFQUNOLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxDQUNMOztZQU5PLFdBQVcsU0FBWCxXQUFXOztBQU9uQixtQkFBVyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7T0FDOUI7S0FDRjtHQUNGOztBQUVELEtBQUcsRUFBQSxlQUE0QjtRQUEzQixRQUFpQix5REFBRyxLQUFLOztBQUMzQixRQUFNLE1BQU0sR0FBRyxtQkFBTSxNQUFNLENBQUM7QUFDNUIsUUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPO0FBQ3BCLFFBQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEQsUUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLGFBQU87S0FDUjs7b0NBRW1CLFNBQVM7O1FBQXRCLElBQUk7UUFBRSxHQUFHOztBQUNoQixRQUFJLElBQUksRUFBRTtBQUNSLFVBQUksUUFBUSxLQUFLLElBQUksRUFBRTtBQUNyQixtQkFBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDbkM7QUFDRCxVQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztLQUM1QztHQUNGOztBQUVELFFBQU0sRUFBQSxnQkFBQyxXQUErQixFQUFFOzs7UUFDOUIsTUFBTSxzQkFBTixNQUFNO1FBQUUsTUFBTSxzQkFBTixNQUFNO1FBQUUsT0FBTyxzQkFBUCxPQUFPO1FBQUUsUUFBUSxzQkFBUixRQUFROztBQUN6QyxRQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU87QUFDN0MsUUFBSSxtQ0FBdUIsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUU7QUFDL0MsVUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLGdEQUFnRCxDQUNqRCxDQUFDO0FBQ0YsYUFBTztLQUNSOztBQUVELFFBQUksTUFBTSxJQUFJLE1BQU0sRUFBRTtBQUNwQixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDMUMsYUFBTztLQUNSOztBQUVELCtCQUFjLGNBQWMsQ0FDMUIsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsVUFBQyxNQUFNLEVBQWdCO0FBQ3JCLGFBQUssT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDM0MsQ0FDRixDQUFDO0dBQ0g7O0FBRUQsU0FBTyxFQUFBLGlCQUNMLE1BQXVCLEVBQ3ZCLE1BQWMsRUFDZCxXQUErQixFQUMvQjs7OztBQUNBLFFBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3RELHdCQUFFLE9BQU8sQ0FDUCxLQUFLLEVBQ0wsVUFBQyxLQUFjO1VBQVosS0FBSyxHQUFQLEtBQWMsQ0FBWixLQUFLO1VBQUUsR0FBRyxHQUFaLEtBQWMsQ0FBTCxHQUFHOzBCQUErQztBQUMxRCxZQUFNLElBQUksR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUQsWUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkUsWUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ3hEO0tBQUEsQ0FDRixDQUFDO0dBQ0g7O0FBRUQsYUFBVyxFQUFBLHVCQUFHO0FBQ1osUUFBTSxNQUFNLEdBQUcsbUJBQU0sTUFBTSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTztBQUNwQixRQUFJLG1DQUF1QixNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRTtBQUMvQyxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsc0RBQXNELENBQ3ZELENBQUM7QUFDRixhQUFPO0tBQ1I7O0FBRUQsUUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3RDLFFBQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUMxRSxRQUFNLElBQUksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRWpELFFBQUksSUFBSSxFQUFFO0FBQ1IsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDNUM7R0FDRjs7QUFFRCxTQUFPLEVBQUEsbUJBQTRCO1FBQTNCLFFBQWlCLHlEQUFHLEtBQUs7O0FBQy9CLFFBQU0sTUFBTSxHQUFHLG1CQUFNLE1BQU0sQ0FBQztBQUM1QixRQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87O3NDQUNHLFdBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDOztRQUFqRCxLQUFLLCtCQUFMLEtBQUs7UUFBRSxHQUFHLCtCQUFILEdBQUc7O0FBQ2xCLFFBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1RCxRQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFdkUsUUFBSSxJQUFJLEVBQUU7QUFDUixVQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDckIsbUJBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ3RDO0FBQ0QsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDL0M7R0FDRjs7QUFFRCxnQkFBYyxFQUFBLDBCQUFHOzs7QUFDZiwrQkFDRywyQkFBMkIsQ0FBQyxtQkFBTSxPQUFPLENBQUMsQ0FDMUMsSUFBSSxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQ25CLFVBQUksT0FBSyxZQUFZLEVBQUU7QUFDckIsZUFBSyxZQUFZLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztPQUM3QyxNQUFNO0FBQ0wsZUFBSyxZQUFZLEdBQUcsOEJBQWlCLFdBQVcsQ0FBQyxDQUFDOztBQUVsRCxlQUFLLFlBQVksQ0FBQyxXQUFXLEdBQUcsVUFBQyxVQUFVLEVBQWlCO2NBQ2xELE1BQU0sc0JBQU4sTUFBTTtjQUFFLE9BQU8sc0JBQVAsT0FBTztjQUFFLFFBQVEsc0JBQVIsUUFBUTs7QUFDakMsY0FBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPO0FBQzdDLDZCQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFdEIscUNBQWMsV0FBVyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2xFLENBQUM7T0FDSDs7QUFFRCxhQUFLLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUM1QixDQUFDLENBQUM7R0FDTjs7QUFFRCxtQkFBaUIsRUFBQSw2QkFBRztBQUNsQixRQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN4QixVQUFJLENBQUMsY0FBYyxHQUFHLGdDQUFtQixVQUFDLFNBQVMsRUFBZTtBQUNoRSxZQUFNLE1BQU0sR0FBRyx3QkFBVyxTQUFTLENBQUMsQ0FBQztBQUNyQywyQkFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxNQUFNLHNCQUFOLE1BQU07WUFBRSxPQUFPLHNCQUFQLE9BQU87WUFBRSxRQUFRLHNCQUFSLFFBQVE7O0FBQ2pDLFlBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTzs7QUFFN0MsWUFBSSxNQUFNLENBQUMsU0FBUyxrQ0FBcUIsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRTVELDJCQUFNLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztPQUNwRCxDQUFDLENBQUM7S0FDSjs7QUFFRCxRQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFDLFVBQVU7YUFDcEMsc0NBQTBCLFVBQVUsRUFBRSxtQkFBTSxPQUFPLENBQUM7S0FBQSxDQUNyRCxDQUFDO0dBQ0g7Q0FDRixDQUFDOztxQkFFYSxRQUFRIiwiZmlsZSI6Ii9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHtcbiAgRW1pdHRlcixcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRGlzcG9zYWJsZSxcbiAgUG9pbnQsXG4gIFRleHRFZGl0b3Jcbn0gZnJvbSBcImF0b21cIjtcblxuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgYXV0b3J1biB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBLZXJuZWxQaWNrZXIgZnJvbSBcIi4va2VybmVsLXBpY2tlclwiO1xuaW1wb3J0IFdTS2VybmVsUGlja2VyIGZyb20gXCIuL3dzLWtlcm5lbC1waWNrZXJcIjtcbmltcG9ydCBFeGlzdGluZ0tlcm5lbFBpY2tlciBmcm9tIFwiLi9leGlzdGluZy1rZXJuZWwtcGlja2VyXCI7XG5pbXBvcnQgU2lnbmFsTGlzdFZpZXcgZnJvbSBcIi4vc2lnbmFsLWxpc3Qtdmlld1wiO1xuaW1wb3J0ICogYXMgY29kZU1hbmFnZXIgZnJvbSBcIi4vY29kZS1tYW5hZ2VyXCI7XG5cbmltcG9ydCBJbnNwZWN0b3IgZnJvbSBcIi4vY29tcG9uZW50cy9pbnNwZWN0b3JcIjtcbmltcG9ydCBSZXN1bHRWaWV3IGZyb20gXCIuL2NvbXBvbmVudHMvcmVzdWx0LXZpZXdcIjtcbmltcG9ydCBTdGF0dXNCYXIgZnJvbSBcIi4vY29tcG9uZW50cy9zdGF0dXMtYmFyXCI7XG5cbmltcG9ydCBJbnNwZWN0b3JQYW5lIGZyb20gXCIuL3BhbmVzL2luc3BlY3RvclwiO1xuaW1wb3J0IFdhdGNoZXNQYW5lIGZyb20gXCIuL3BhbmVzL3dhdGNoZXNcIjtcbmltcG9ydCBPdXRwdXRQYW5lIGZyb20gXCIuL3BhbmVzL291dHB1dC1hcmVhXCI7XG5pbXBvcnQgS2VybmVsTW9uaXRvclBhbmUgZnJvbSBcIi4vcGFuZXMva2VybmVsLW1vbml0b3JcIjtcblxuaW1wb3J0IHsgdG9nZ2xlSW5zcGVjdG9yIH0gZnJvbSBcIi4vY29tbWFuZHNcIjtcblxuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgT3V0cHV0U3RvcmUgZnJvbSBcIi4vc3RvcmUvb3V0cHV0XCI7XG5cbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQga2VybmVsTWFuYWdlciBmcm9tIFwiLi9rZXJuZWwtbWFuYWdlclwiO1xuaW1wb3J0IFpNUUtlcm5lbCBmcm9tIFwiLi96bXEta2VybmVsXCI7XG5pbXBvcnQgV1NLZXJuZWwgZnJvbSBcIi4vd3Mta2VybmVsXCI7XG5pbXBvcnQgS2VybmVsIGZyb20gXCIuL2tlcm5lbFwiO1xuaW1wb3J0IEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gXCIuL2F1dG9jb21wbGV0ZS1wcm92aWRlclwiO1xuaW1wb3J0IEh5ZHJvZ2VuUHJvdmlkZXIgZnJvbSBcIi4vcGx1Z2luLWFwaS9oeWRyb2dlbi1wcm92aWRlclwiO1xuXG5pbXBvcnQge1xuICBsb2csXG4gIHJlYWN0RmFjdG9yeSxcbiAgaXNNdWx0aWxhbmd1YWdlR3JhbW1hcixcbiAgcmVuZGVyRGV2VG9vbHMsXG4gIElOU1BFQ1RPUl9VUkksXG4gIFdBVENIRVNfVVJJLFxuICBPVVRQVVRfQVJFQV9VUkksXG4gIEtFUk5FTF9NT05JVE9SX1VSSSxcbiAgaG90UmVsb2FkUGFja2FnZSxcbiAgb3Blbk9yU2hvd0RvY2ssXG4gIGtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXJcbn0gZnJvbSBcIi4vdXRpbHNcIjtcblxuaW1wb3J0IGV4cG9ydE5vdGVib29rIGZyb20gXCIuL2V4cG9ydC1ub3RlYm9va1wiO1xuXG5jb25zdCBIeWRyb2dlbiA9IHtcbiAgY29uZmlnOiBDb25maWcuc2NoZW1hLFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICBsZXQgc2tpcExhbmd1YWdlTWFwcGluZ3NDaGFuZ2UgPSBmYWxzZTtcbiAgICBzdG9yZS5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICBcIkh5ZHJvZ2VuLmxhbmd1YWdlTWFwcGluZ3NcIixcbiAgICAgICAgKHsgbmV3VmFsdWUsIG9sZFZhbHVlIH0pID0+IHtcbiAgICAgICAgICBpZiAoc2tpcExhbmd1YWdlTWFwcGluZ3NDaGFuZ2UpIHtcbiAgICAgICAgICAgIHNraXBMYW5ndWFnZU1hcHBpbmdzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN0b3JlLnJ1bm5pbmdLZXJuZWxzLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICBza2lwTGFuZ3VhZ2VNYXBwaW5nc0NoYW5nZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldChcIkh5ZHJvZ2VuLmxhbmd1YWdlTWFwcGluZ3NcIiwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJIeWRyb2dlblwiLCB7XG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgIFwiYGxhbmd1YWdlTWFwcGluZ3NgIGNhbm5vdCBiZSB1cGRhdGVkIHdoaWxlIGtlcm5lbHMgYXJlIHJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAvLyBlbmFibGUvZGlzYWJsZSBtb2J4LXJlYWN0LWRldnRvb2xzIGxvZ2dpbmdcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFwiSHlkcm9nZW4uZGVidWdcIiwgKHsgbmV3VmFsdWUgfSkgPT5cbiAgICAgICAgcmVuZGVyRGV2VG9vbHMobmV3VmFsdWUpXG4gICAgICApXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcIkh5ZHJvZ2VuLnN0YXR1c0JhckRpc2FibGVcIiwgbmV3VmFsdWUgPT4ge1xuICAgICAgICBzdG9yZS5zZXRDb25maWdWYWx1ZShcIkh5ZHJvZ2VuLnN0YXR1c0JhckRpc2FibGVcIiwgQm9vbGVhbihuZXdWYWx1ZSkpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSlcIiwge1xuICAgICAgICBcImh5ZHJvZ2VuOnJ1blwiOiAoKSA9PiB0aGlzLnJ1bigpLFxuICAgICAgICBcImh5ZHJvZ2VuOnJ1bi1hbGxcIjogKCkgPT4gdGhpcy5ydW5BbGwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tYWxsLWFib3ZlXCI6ICgpID0+IHRoaXMucnVuQWxsQWJvdmUoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tYW5kLW1vdmUtZG93blwiOiAoKSA9PiB0aGlzLnJ1bih0cnVlKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tY2VsbFwiOiAoKSA9PiB0aGlzLnJ1bkNlbGwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tY2VsbC1hbmQtbW92ZS1kb3duXCI6ICgpID0+IHRoaXMucnVuQ2VsbCh0cnVlKSxcbiAgICAgICAgXCJoeWRyb2dlbjp0b2dnbGUtd2F0Y2hlc1wiOiAoKSA9PiBhdG9tLndvcmtzcGFjZS50b2dnbGUoV0FUQ0hFU19VUkkpLFxuICAgICAgICBcImh5ZHJvZ2VuOnRvZ2dsZS1vdXRwdXQtYXJlYVwiOiAoKSA9PlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLnRvZ2dsZShPVVRQVVRfQVJFQV9VUkkpLFxuICAgICAgICBcImh5ZHJvZ2VuOnRvZ2dsZS1rZXJuZWwtbW9uaXRvclwiOiAoKSA9PlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLnRvZ2dsZShLRVJORUxfTU9OSVRPUl9VUkkpLFxuICAgICAgICBcImh5ZHJvZ2VuOnN0YXJ0LWxvY2FsLWtlcm5lbFwiOiAoKSA9PiB0aGlzLnN0YXJ0Wk1RS2VybmVsKCksXG4gICAgICAgIFwiaHlkcm9nZW46Y29ubmVjdC10by1yZW1vdGUta2VybmVsXCI6ICgpID0+IHRoaXMuY29ubmVjdFRvV1NLZXJuZWwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpjb25uZWN0LXRvLWV4aXN0aW5nLWtlcm5lbFwiOiAoKSA9PlxuICAgICAgICAgIHRoaXMuY29ubmVjdFRvRXhpc3RpbmdLZXJuZWwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjphZGQtd2F0Y2hcIjogKCkgPT4ge1xuICAgICAgICAgIGlmIChzdG9yZS5rZXJuZWwpIHtcbiAgICAgICAgICAgIHN0b3JlLmtlcm5lbC53YXRjaGVzU3RvcmUuYWRkV2F0Y2hGcm9tRWRpdG9yKHN0b3JlLmVkaXRvcik7XG4gICAgICAgICAgICBvcGVuT3JTaG93RG9jayhXQVRDSEVTX1VSSSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImh5ZHJvZ2VuOnJlbW92ZS13YXRjaFwiOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHN0b3JlLmtlcm5lbCkge1xuICAgICAgICAgICAgc3RvcmUua2VybmVsLndhdGNoZXNTdG9yZS5yZW1vdmVXYXRjaCgpO1xuICAgICAgICAgICAgb3Blbk9yU2hvd0RvY2soV0FUQ0hFU19VUkkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJoeWRyb2dlbjp1cGRhdGUta2VybmVsc1wiOiAoKSA9PiBrZXJuZWxNYW5hZ2VyLnVwZGF0ZUtlcm5lbFNwZWNzKCksXG4gICAgICAgIFwiaHlkcm9nZW46dG9nZ2xlLWluc3BlY3RvclwiOiAoKSA9PiB0b2dnbGVJbnNwZWN0b3Ioc3RvcmUpLFxuICAgICAgICBcImh5ZHJvZ2VuOmludGVycnVwdC1rZXJuZWxcIjogKCkgPT5cbiAgICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoeyBjb21tYW5kOiBcImludGVycnVwdC1rZXJuZWxcIiB9KSxcbiAgICAgICAgXCJoeWRyb2dlbjpyZXN0YXJ0LWtlcm5lbFwiOiAoKSA9PlxuICAgICAgICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZCh7IGNvbW1hbmQ6IFwicmVzdGFydC1rZXJuZWxcIiB9KSxcbiAgICAgICAgXCJoeWRyb2dlbjpyZXN0YXJ0LWtlcm5lbC1hbmQtcmUtZXZhbHVhdGUtYnViYmxlc1wiOiAoKSA9PlxuICAgICAgICAgIHRoaXMucmVzdGFydEtlcm5lbEFuZFJlRXZhbHVhdGVCdWJibGVzKCksXG4gICAgICAgIFwiaHlkcm9nZW46c2h1dGRvd24ta2VybmVsXCI6ICgpID0+XG4gICAgICAgICAgdGhpcy5oYW5kbGVLZXJuZWxDb21tYW5kKHsgY29tbWFuZDogXCJzaHV0ZG93bi1rZXJuZWxcIiB9KSxcbiAgICAgICAgXCJoeWRyb2dlbjp0b2dnbGUtYnViYmxlXCI6ICgpID0+IHRoaXMudG9nZ2xlQnViYmxlKCksXG4gICAgICAgIFwiaHlkcm9nZW46ZXhwb3J0LW5vdGVib29rXCI6ICgpID0+IGV4cG9ydE5vdGVib29rKClcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCB7XG4gICAgICAgIFwiaHlkcm9nZW46Y2xlYXItcmVzdWx0c1wiOiAoKSA9PiB7XG4gICAgICAgICAgc3RvcmUubWFya2Vycy5jbGVhcigpO1xuICAgICAgICAgIGlmICghc3RvcmUua2VybmVsKSByZXR1cm47XG4gICAgICAgICAgc3RvcmUua2VybmVsLm91dHB1dFN0b3JlLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGlmIChhdG9tLmluRGV2TW9kZSgpKSB7XG4gICAgICBzdG9yZS5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCB7XG4gICAgICAgICAgXCJoeWRyb2dlbjpob3QtcmVsb2FkLXBhY2thZ2VcIjogKCkgPT4gaG90UmVsb2FkUGFja2FnZSgpXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVRleHRFZGl0b3IoZWRpdG9yID0+IHtcbiAgICAgICAgc3RvcmUudXBkYXRlRWRpdG9yKGVkaXRvcik7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBzdG9yZS5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3JTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlR3JhbW1hcigoKSA9PiB7XG4gICAgICAgICAgICBzdG9yZS5zZXRHcmFtbWFyKGVkaXRvcik7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoaXNNdWx0aWxhbmd1YWdlR3JhbW1hcihlZGl0b3IuZ2V0R3JhbW1hcigpKSkge1xuICAgICAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oXG4gICAgICAgICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0b3JlLnNldEdyYW1tYXIoZWRpdG9yKTtcbiAgICAgICAgICAgICAgfSwgNzUpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICAgIGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgICBlZGl0b3Iub25EaWRDaGFuZ2VUaXRsZShuZXdUaXRsZSA9PiBzdG9yZS5mb3JjZUVkaXRvclVwZGF0ZSgpKVxuICAgICAgICApO1xuXG4gICAgICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvclN1YnNjcmlwdGlvbnMpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgdGhpcy5oeWRyb2dlblByb3ZpZGVyID0gbnVsbDtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKHVyaSA9PiB7XG4gICAgICAgIHN3aXRjaCAodXJpKSB7XG4gICAgICAgICAgY2FzZSBJTlNQRUNUT1JfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnNwZWN0b3JQYW5lKHN0b3JlKTtcbiAgICAgICAgICBjYXNlIFdBVENIRVNfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBXYXRjaGVzUGFuZShzdG9yZSk7XG4gICAgICAgICAgY2FzZSBPVVRQVVRfQVJFQV9VUkk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE91dHB1dFBhbmUoc3RvcmUpO1xuICAgICAgICAgIGNhc2UgS0VSTkVMX01PTklUT1JfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLZXJuZWxNb25pdG9yUGFuZShzdG9yZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgLy8gRGVzdHJveSBhbnkgUGFuZXMgd2hlbiB0aGUgcGFja2FnZSBpcyBkZWFjdGl2YXRlZC5cbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKCkuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpdGVtIGluc3RhbmNlb2YgSW5zcGVjdG9yUGFuZSB8fFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIFdhdGNoZXNQYW5lIHx8XG4gICAgICAgICAgICBpdGVtIGluc3RhbmNlb2YgT3V0cHV0UGFuZSB8fFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIEtlcm5lbE1vbml0b3JQYW5lXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpdGVtLmRlc3Ryb3koKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgcmVuZGVyRGV2VG9vbHMoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4uZGVidWdcIikgPT09IHRydWUpO1xuXG4gICAgYXV0b3J1bigoKSA9PiB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdChcImRpZC1jaGFuZ2Uta2VybmVsXCIsIHN0b3JlLmtlcm5lbCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBzdG9yZS5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUh5ZHJvZ2VuKCkge1xuICAgIGlmICghdGhpcy5oeWRyb2dlblByb3ZpZGVyKSB7XG4gICAgICB0aGlzLmh5ZHJvZ2VuUHJvdmlkZXIgPSBuZXcgSHlkcm9nZW5Qcm92aWRlcih0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5oeWRyb2dlblByb3ZpZGVyO1xuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhdG9tJFN0YXR1c0Jhcikge1xuICAgIGNvbnN0IHN0YXR1c0JhckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHN0YXR1c0JhckVsZW1lbnQuY2xhc3NOYW1lID0gXCJpbmxpbmUtYmxvY2tcIjtcblxuICAgIHN0YXR1c0Jhci5hZGRMZWZ0VGlsZSh7XG4gICAgICBpdGVtOiBzdGF0dXNCYXJFbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IDEwMFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25DbGljayA9IHRoaXMuc2hvd0tlcm5lbENvbW1hbmRzLmJpbmQodGhpcyk7XG5cbiAgICByZWFjdEZhY3RvcnkoXG4gICAgICA8U3RhdHVzQmFyIHN0b3JlPXtzdG9yZX0gb25DbGljaz17b25DbGlja30gLz4sXG4gICAgICBzdGF0dXNCYXJFbGVtZW50XG4gICAgKTtcblxuICAgIC8vIFdlIHNob3VsZCByZXR1cm4gYSBkaXNwb3NhYmxlIGhlcmUgYnV0IEF0b20gZmFpbHMgd2hpbGUgY2FsbGluZyAuZGVzdHJveSgpXG4gICAgLy8gcmV0dXJuIG5ldyBEaXNwb3NhYmxlKHN0YXR1c0JhclRpbGUuZGVzdHJveSk7XG4gIH0sXG5cbiAgcHJvdmlkZSgpIHtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4uYXV0b2NvbXBsZXRlXCIpID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gQXV0b2NvbXBsZXRlUHJvdmlkZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgc2hvd0tlcm5lbENvbW1hbmRzKCkge1xuICAgIGlmICghdGhpcy5zaWduYWxMaXN0Vmlldykge1xuICAgICAgdGhpcy5zaWduYWxMaXN0VmlldyA9IG5ldyBTaWduYWxMaXN0VmlldygpO1xuICAgICAgdGhpcy5zaWduYWxMaXN0Vmlldy5vbkNvbmZpcm1lZCA9IChrZXJuZWxDb21tYW5kOiB7IGNvbW1hbmQ6IHN0cmluZyB9KSA9PlxuICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoa2VybmVsQ29tbWFuZCk7XG4gICAgfVxuICAgIHRoaXMuc2lnbmFsTGlzdFZpZXcudG9nZ2xlKCk7XG4gIH0sXG5cbiAgY29ubmVjdFRvRXhpc3RpbmdLZXJuZWwoKSB7XG4gICAgaWYgKCF0aGlzLmV4aXN0aW5nS2VybmVsUGlja2VyKSB7XG4gICAgICB0aGlzLmV4aXN0aW5nS2VybmVsUGlja2VyID0gbmV3IEV4aXN0aW5nS2VybmVsUGlja2VyKCk7XG4gICAgfVxuICAgIHRoaXMuZXhpc3RpbmdLZXJuZWxQaWNrZXIudG9nZ2xlKCk7XG4gIH0sXG5cbiAgaGFuZGxlS2VybmVsQ29tbWFuZCh7XG4gICAgY29tbWFuZCxcbiAgICBwYXlsb2FkXG4gIH06IHtcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgcGF5bG9hZDogP0tlcm5lbHNwZWNcbiAgfSkge1xuICAgIGxvZyhcImhhbmRsZUtlcm5lbENvbW1hbmQ6XCIsIGFyZ3VtZW50cyk7XG5cbiAgICBjb25zdCB7IGtlcm5lbCwgZ3JhbW1hciB9ID0gc3RvcmU7XG5cbiAgICBpZiAoIWdyYW1tYXIpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIlVuZGVmaW5lZCBncmFtbWFyXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgha2VybmVsKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYE5vIHJ1bm5pbmcga2VybmVsIGZvciBncmFtbWFyIFxcYCR7Z3JhbW1hci5uYW1lfVxcYCBmb3VuZGA7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbW1hbmQgPT09IFwiaW50ZXJydXB0LWtlcm5lbFwiKSB7XG4gICAgICBrZXJuZWwuaW50ZXJydXB0KCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcInJlc3RhcnQta2VybmVsXCIpIHtcbiAgICAgIGtlcm5lbC5yZXN0YXJ0KCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcInNodXRkb3duLWtlcm5lbFwiKSB7XG4gICAgICBzdG9yZS5tYXJrZXJzLmNsZWFyKCk7XG4gICAgICAvLyBOb3RlIHRoYXQgZGVzdHJveSBhbG9uZSBkb2VzIG5vdCBzaHV0IGRvd24gYSBXU0tlcm5lbFxuICAgICAga2VybmVsLnNodXRkb3duKCk7XG4gICAgICBrZXJuZWwuZGVzdHJveSgpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBjb21tYW5kID09PSBcInJlbmFtZS1rZXJuZWxcIiAmJlxuICAgICAga2VybmVsLnRyYW5zcG9ydCBpbnN0YW5jZW9mIFdTS2VybmVsXG4gICAgKSB7XG4gICAgICBrZXJuZWwudHJhbnNwb3J0LnByb21wdFJlbmFtZSgpO1xuICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PT0gXCJkaXNjb25uZWN0LWtlcm5lbFwiKSB7XG4gICAgICBzdG9yZS5tYXJrZXJzLmNsZWFyKCk7XG4gICAgICBrZXJuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVSZXN1bHRCdWJibGUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIGNvZGU6IHN0cmluZywgcm93OiBudW1iZXIpIHtcbiAgICBjb25zdCB7IGdyYW1tYXIsIGZpbGVQYXRoLCBrZXJuZWwgfSA9IHN0b3JlO1xuXG4gICAgaWYgKCFmaWxlUGF0aCB8fCAhZ3JhbW1hcikge1xuICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgXCJZb3VyIGZpbGUgbXVzdCBiZSBzYXZlZCBpbiBvcmRlciB0byBzdGFydCBhIGtlcm5lbFwiXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChrZXJuZWwpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGtlcm5lbCwgY29kZSwgcm93KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBrZXJuZWxNYW5hZ2VyLnN0YXJ0S2VybmVsRm9yKFxuICAgICAgZ3JhbW1hcixcbiAgICAgIGVkaXRvcixcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgKGtlcm5lbDogWk1RS2VybmVsKSA9PiB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGtlcm5lbCwgY29kZSwgcm93KTtcbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIF9jcmVhdGVSZXN1bHRCdWJibGUoXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAga2VybmVsOiBLZXJuZWwsXG4gICAgY29kZTogc3RyaW5nLFxuICAgIHJvdzogbnVtYmVyXG4gICkge1xuICAgIGlmIChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpIGluc3RhbmNlb2YgV2F0Y2hlc1BhbmUpIHtcbiAgICAgIGtlcm5lbC53YXRjaGVzU3RvcmUucnVuKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGdsb2JhbE91dHB1dFN0b3JlID1cbiAgICAgIGF0b20uY29uZmlnLmdldChcIkh5ZHJvZ2VuLm91dHB1dEFyZWFEZWZhdWx0XCIpIHx8XG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKS5maW5kKGl0ZW0gPT4gaXRlbSBpbnN0YW5jZW9mIE91dHB1dFBhbmUpXG4gICAgICAgID8ga2VybmVsLm91dHB1dFN0b3JlXG4gICAgICAgIDogbnVsbDtcblxuICAgIGlmIChnbG9iYWxPdXRwdXRTdG9yZSkgb3Blbk9yU2hvd0RvY2soT1VUUFVUX0FSRUFfVVJJKTtcblxuICAgIGNvbnN0IHsgb3V0cHV0U3RvcmUgfSA9IG5ldyBSZXN1bHRWaWV3KFxuICAgICAgc3RvcmUubWFya2VycyxcbiAgICAgIGtlcm5lbCxcbiAgICAgIGVkaXRvcixcbiAgICAgIHJvdyxcbiAgICAgICFnbG9iYWxPdXRwdXRTdG9yZVxuICAgICk7XG5cbiAgICBrZXJuZWwuZXhlY3V0ZShjb2RlLCByZXN1bHQgPT4ge1xuICAgICAgb3V0cHV0U3RvcmUuYXBwZW5kT3V0cHV0KHJlc3VsdCk7XG4gICAgICBpZiAoZ2xvYmFsT3V0cHV0U3RvcmUpIGdsb2JhbE91dHB1dFN0b3JlLmFwcGVuZE91dHB1dChyZXN1bHQpO1xuICAgIH0pO1xuICB9LFxuXG4gIHJlc3RhcnRLZXJuZWxBbmRSZUV2YWx1YXRlQnViYmxlcygpIHtcbiAgICBjb25zdCB7IGVkaXRvciwga2VybmVsLCBtYXJrZXJzIH0gPSBzdG9yZTtcblxuICAgIGxldCBicmVha3BvaW50cyA9IFtdO1xuICAgIG1hcmtlcnMubWFya2Vycy5mb3JFYWNoKChidWJibGU6IFJlc3VsdFZpZXcpID0+IHtcbiAgICAgIGJyZWFrcG9pbnRzLnB1c2goYnViYmxlLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0KTtcbiAgICB9KTtcbiAgICBzdG9yZS5tYXJrZXJzLmNsZWFyKCk7XG5cbiAgICBpZiAoIWVkaXRvciB8fCAha2VybmVsKSB7XG4gICAgICB0aGlzLnJ1bkFsbChicmVha3BvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtlcm5lbC5yZXN0YXJ0KCgpID0+IHRoaXMucnVuQWxsKGJyZWFrcG9pbnRzKSk7XG4gICAgfVxuICB9LFxuXG4gIHRvZ2dsZUJ1YmJsZSgpIHtcbiAgICBjb25zdCB7IGVkaXRvciwga2VybmVsLCBtYXJrZXJzIH0gPSBzdG9yZTtcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuZ2V0QnVmZmVyUm93UmFuZ2UoKTtcblxuICAgIGZvciAobGV0IHJvdyA9IHN0YXJ0Um93OyByb3cgPD0gZW5kUm93OyByb3crKykge1xuICAgICAgY29uc3QgZGVzdHJveWVkID0gbWFya2Vycy5jbGVhck9uUm93KHJvdyk7XG5cbiAgICAgIGlmICghZGVzdHJveWVkKSB7XG4gICAgICAgIGNvbnN0IHsgb3V0cHV0U3RvcmUgfSA9IG5ldyBSZXN1bHRWaWV3KFxuICAgICAgICAgIG1hcmtlcnMsXG4gICAgICAgICAga2VybmVsLFxuICAgICAgICAgIGVkaXRvcixcbiAgICAgICAgICByb3csXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgICBvdXRwdXRTdG9yZS5zdGF0dXMgPSBcImVtcHR5XCI7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHJ1bihtb3ZlRG93bjogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgY29uc3QgZWRpdG9yID0gc3RvcmUuZWRpdG9yO1xuICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgY29uc3QgY29kZUJsb2NrID0gY29kZU1hbmFnZXIuZmluZENvZGVCbG9jayhlZGl0b3IpO1xuICAgIGlmICghY29kZUJsb2NrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgW2NvZGUsIHJvd10gPSBjb2RlQmxvY2s7XG4gICAgaWYgKGNvZGUpIHtcbiAgICAgIGlmIChtb3ZlRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBjb2RlTWFuYWdlci5tb3ZlRG93bihlZGl0b3IsIHJvdyk7XG4gICAgICB9XG4gICAgICB0aGlzLmNyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGNvZGUsIHJvdyk7XG4gICAgfVxuICB9LFxuXG4gIHJ1bkFsbChicmVha3BvaW50czogP0FycmF5PGF0b20kUG9pbnQ+KSB7XG4gICAgY29uc3QgeyBlZGl0b3IsIGtlcm5lbCwgZ3JhbW1hciwgZmlsZVBhdGggfSA9IHN0b3JlO1xuICAgIGlmICghZWRpdG9yIHx8ICFncmFtbWFyIHx8ICFmaWxlUGF0aCkgcmV0dXJuO1xuICAgIGlmIChpc011bHRpbGFuZ3VhZ2VHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICdcIlJ1biBBbGxcIiBpcyBub3Qgc3VwcG9ydGVkIGZvciB0aGlzIGZpbGUgdHlwZSEnXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChlZGl0b3IgJiYga2VybmVsKSB7XG4gICAgICB0aGlzLl9ydW5BbGwoZWRpdG9yLCBrZXJuZWwsIGJyZWFrcG9pbnRzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBrZXJuZWxNYW5hZ2VyLnN0YXJ0S2VybmVsRm9yKFxuICAgICAgZ3JhbW1hcixcbiAgICAgIGVkaXRvcixcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgKGtlcm5lbDogWk1RS2VybmVsKSA9PiB7XG4gICAgICAgIHRoaXMuX3J1bkFsbChlZGl0b3IsIGtlcm5lbCwgYnJlYWtwb2ludHMpO1xuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgX3J1bkFsbChcbiAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICBrZXJuZWw6IEtlcm5lbCxcbiAgICBicmVha3BvaW50cz86IEFycmF5PGF0b20kUG9pbnQ+XG4gICkge1xuICAgIGxldCBjZWxscyA9IGNvZGVNYW5hZ2VyLmdldENlbGxzKGVkaXRvciwgYnJlYWtwb2ludHMpO1xuICAgIF8uZm9yRWFjaChcbiAgICAgIGNlbGxzLFxuICAgICAgKHsgc3RhcnQsIGVuZCB9OiB7IHN0YXJ0OiBhdG9tJFBvaW50LCBlbmQ6IGF0b20kUG9pbnQgfSkgPT4ge1xuICAgICAgICBjb25zdCBjb2RlID0gY29kZU1hbmFnZXIuZ2V0VGV4dEluUmFuZ2UoZWRpdG9yLCBzdGFydCwgZW5kKTtcbiAgICAgICAgY29uc3QgZW5kUm93ID0gY29kZU1hbmFnZXIuZXNjYXBlQmxhbmtSb3dzKGVkaXRvciwgc3RhcnQucm93LCBlbmQucm93KTtcbiAgICAgICAgdGhpcy5fY3JlYXRlUmVzdWx0QnViYmxlKGVkaXRvciwga2VybmVsLCBjb2RlLCBlbmRSb3cpO1xuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgcnVuQWxsQWJvdmUoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gc3RvcmUuZWRpdG9yOyAvLyB0byBtYWtlIGZsb3cgaGFwcHlcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgIGlmIChpc011bHRpbGFuZ3VhZ2VHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICdcIlJ1biBBbGwgQWJvdmVcIiBpcyBub3Qgc3VwcG9ydGVkIGZvciB0aGlzIGZpbGUgdHlwZSEnXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk7XG4gICAgY29uc3Qgcm93ID0gY29kZU1hbmFnZXIuZXNjYXBlQmxhbmtSb3dzKGVkaXRvciwgMCwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKTtcbiAgICBjb25zdCBjb2RlID0gY29kZU1hbmFnZXIuZ2V0Um93cyhlZGl0b3IsIDAsIHJvdyk7XG5cbiAgICBpZiAoY29kZSkge1xuICAgICAgdGhpcy5jcmVhdGVSZXN1bHRCdWJibGUoZWRpdG9yLCBjb2RlLCByb3cpO1xuICAgIH1cbiAgfSxcblxuICBydW5DZWxsKG1vdmVEb3duOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBzdG9yZS5lZGl0b3I7XG4gICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGNvZGVNYW5hZ2VyLmdldEN1cnJlbnRDZWxsKGVkaXRvcik7XG4gICAgY29uc3QgY29kZSA9IGNvZGVNYW5hZ2VyLmdldFRleHRJblJhbmdlKGVkaXRvciwgc3RhcnQsIGVuZCk7XG4gICAgY29uc3QgZW5kUm93ID0gY29kZU1hbmFnZXIuZXNjYXBlQmxhbmtSb3dzKGVkaXRvciwgc3RhcnQucm93LCBlbmQucm93KTtcblxuICAgIGlmIChjb2RlKSB7XG4gICAgICBpZiAobW92ZURvd24gPT09IHRydWUpIHtcbiAgICAgICAgY29kZU1hbmFnZXIubW92ZURvd24oZWRpdG9yLCBlbmRSb3cpO1xuICAgICAgfVxuICAgICAgdGhpcy5jcmVhdGVSZXN1bHRCdWJibGUoZWRpdG9yLCBjb2RlLCBlbmRSb3cpO1xuICAgIH1cbiAgfSxcblxuICBzdGFydFpNUUtlcm5lbCgpIHtcbiAgICBrZXJuZWxNYW5hZ2VyXG4gICAgICAuZ2V0QWxsS2VybmVsU3BlY3NGb3JHcmFtbWFyKHN0b3JlLmdyYW1tYXIpXG4gICAgICAudGhlbihrZXJuZWxTcGVjcyA9PiB7XG4gICAgICAgIGlmICh0aGlzLmtlcm5lbFBpY2tlcikge1xuICAgICAgICAgIHRoaXMua2VybmVsUGlja2VyLmtlcm5lbFNwZWNzID0ga2VybmVsU3BlY3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIgPSBuZXcgS2VybmVsUGlja2VyKGtlcm5lbFNwZWNzKTtcblxuICAgICAgICAgIHRoaXMua2VybmVsUGlja2VyLm9uQ29uZmlybWVkID0gKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgZWRpdG9yLCBncmFtbWFyLCBmaWxlUGF0aCB9ID0gc3RvcmU7XG4gICAgICAgICAgICBpZiAoIWVkaXRvciB8fCAhZ3JhbW1hciB8fCAhZmlsZVBhdGgpIHJldHVybjtcbiAgICAgICAgICAgIHN0b3JlLm1hcmtlcnMuY2xlYXIoKTtcblxuICAgICAgICAgICAga2VybmVsTWFuYWdlci5zdGFydEtlcm5lbChrZXJuZWxTcGVjLCBncmFtbWFyLCBlZGl0b3IsIGZpbGVQYXRoKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIudG9nZ2xlKCk7XG4gICAgICB9KTtcbiAgfSxcblxuICBjb25uZWN0VG9XU0tlcm5lbCgpIHtcbiAgICBpZiAoIXRoaXMud3NLZXJuZWxQaWNrZXIpIHtcbiAgICAgIHRoaXMud3NLZXJuZWxQaWNrZXIgPSBuZXcgV1NLZXJuZWxQaWNrZXIoKHRyYW5zcG9ydDogV1NLZXJuZWwpID0+IHtcbiAgICAgICAgY29uc3Qga2VybmVsID0gbmV3IEtlcm5lbCh0cmFuc3BvcnQpO1xuICAgICAgICBzdG9yZS5tYXJrZXJzLmNsZWFyKCk7XG4gICAgICAgIGNvbnN0IHsgZWRpdG9yLCBncmFtbWFyLCBmaWxlUGF0aCB9ID0gc3RvcmU7XG4gICAgICAgIGlmICghZWRpdG9yIHx8ICFncmFtbWFyIHx8ICFmaWxlUGF0aCkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChrZXJuZWwudHJhbnNwb3J0IGluc3RhbmNlb2YgWk1RS2VybmVsKSBrZXJuZWwuZGVzdHJveSgpO1xuXG4gICAgICAgIHN0b3JlLm5ld0tlcm5lbChrZXJuZWwsIGZpbGVQYXRoLCBlZGl0b3IsIGdyYW1tYXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy53c0tlcm5lbFBpY2tlci50b2dnbGUoKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMpID0+XG4gICAgICBrZXJuZWxTcGVjUHJvdmlkZXNHcmFtbWFyKGtlcm5lbFNwZWMsIHN0b3JlLmdyYW1tYXIpXG4gICAgKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgSHlkcm9nZW47XG4iXX0=