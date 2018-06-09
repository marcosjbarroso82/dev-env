Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _kernelspecs = require("kernelspecs");

var kernelspecs = _interopRequireWildcard(_kernelspecs);

var _spawnteract = require("spawnteract");

var _electron = require("electron");

var _zmqKernel = require("./zmq-kernel");

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _kernel = require("./kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var _kernelPicker = require("./kernel-picker");

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _utils = require("./utils");

var ks = kernelspecs;

exports.ks = ks;

var KernelManager = (function () {
  function KernelManager() {
    _classCallCheck(this, KernelManager);

    this.kernelSpecs = null;
  }

  _createClass(KernelManager, [{
    key: "startKernelFor",
    value: function startKernelFor(grammar, editor, filePath, onStarted) {
      var _this = this;

      this.getKernelSpecForGrammar(grammar).then(function (kernelSpec) {
        if (!kernelSpec) {
          var message = "No kernel for grammar `" + grammar.name + "` found";
          var pythonDescription = grammar && /python/g.test(grammar.scopeName) ? "\n\nTo detect your current Python install you will need to run:<pre>python -m pip install ipykernel\npython -m ipykernel install --user</pre>" : "";
          var description = "Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it." + pythonDescription;
          atom.notifications.addError(message, {
            description: description,
            dismissable: pythonDescription !== ""
          });
          return;
        }

        _this.startKernel(kernelSpec, grammar, editor, filePath, onStarted);
      });
    }
  }, {
    key: "startKernel",
    value: function startKernel(kernelSpec, grammar, editor, filePath, onStarted) {
      var displayName = kernelSpec.display_name;

      // if kernel startup already in progress don't start additional kernel
      if (_store2["default"].startingKernels.get(displayName)) return;

      _store2["default"].startKernel(displayName);

      var currentPath = (0, _utils.getEditorDirectory)(editor);
      var projectPath = undefined;

      (0, _utils.log)("KernelManager: startKernel:", displayName);

      switch (atom.config.get("Hydrogen.startDir")) {
        case "firstProjectDir":
          projectPath = atom.project.getPaths()[0];
          break;
        case "projectDirOfFile":
          projectPath = atom.project.relativizePath(currentPath)[0];
          break;
      }

      var kernelStartDir = projectPath != null ? projectPath : currentPath;
      var options = {
        cwd: kernelStartDir,
        stdio: ["ignore", "pipe", "pipe"]
      };

      var transport = new _zmqKernel2["default"](kernelSpec, grammar, options, function () {
        var kernel = new _kernel2["default"](transport);
        _store2["default"].newKernel(kernel, filePath, editor, grammar);
        if (onStarted) onStarted(kernel);
      });
    }
  }, {
    key: "update",
    value: _asyncToGenerator(function* () {
      var kernelSpecs = yield ks.findAll();
      this.kernelSpecs = _lodash2["default"].sortBy(_lodash2["default"].map(kernelSpecs, "spec"), function (spec) {
        return spec.display_name;
      });
      return this.kernelSpecs;
    })
  }, {
    key: "getAllKernelSpecs",
    value: _asyncToGenerator(function* (grammar) {
      if (this.kernelSpecs) return this.kernelSpecs;
      return this.updateKernelSpecs(grammar);
    })
  }, {
    key: "getAllKernelSpecsForGrammar",
    value: _asyncToGenerator(function* (grammar) {
      if (!grammar) return [];

      var kernelSpecs = yield this.getAllKernelSpecs(grammar);
      return kernelSpecs.filter(function (spec) {
        return (0, _utils.kernelSpecProvidesGrammar)(spec, grammar);
      });
    })
  }, {
    key: "getKernelSpecForGrammar",
    value: _asyncToGenerator(function* (grammar) {
      var _this2 = this;

      var kernelSpecs = yield this.getAllKernelSpecsForGrammar(grammar);
      if (kernelSpecs.length <= 1) {
        return kernelSpecs[0];
      }

      if (this.kernelPicker) {
        this.kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        this.kernelPicker = new _kernelPicker2["default"](kernelSpecs);
      }

      return new Promise(function (resolve) {
        if (!_this2.kernelPicker) return resolve(null);
        _this2.kernelPicker.onConfirmed = function (kernelSpec) {
          return resolve(kernelSpec);
        };
        _this2.kernelPicker.toggle();
      });
    })
  }, {
    key: "updateKernelSpecs",
    value: _asyncToGenerator(function* (grammar) {
      var kernelSpecs = yield this.update();

      if (kernelSpecs.length === 0) {
        var message = "No Kernels Installed";

        var options = {
          description: "No kernels are installed on your system so you will not be able to execute code in any language.",
          dismissable: true,
          buttons: [{
            text: "Install Instructions",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://nteract.gitbooks.io/hydrogen/docs/Installation.html");
            }
          }, {
            text: "Popular Kernels",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://nteract.io/kernels");
            }
          }, {
            text: "All Kernels",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://github.com/jupyter/jupyter/wiki/Jupyter-kernels");
            }
          }]
        };
        atom.notifications.addError(message, options);
      } else {
        var message = "Hydrogen Kernels updated:";
        var options = {
          detail: _lodash2["default"].map(kernelSpecs, "display_name").join("\n")
        };
        atom.notifications.addInfo(message, options);
      }
      return kernelSpecs;
    })
  }]);

  return KernelManager;
})();

exports.KernelManager = KernelManager;
exports["default"] = new KernelManager();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFYyxRQUFROzs7OzJCQUNPLGFBQWE7O0lBQTlCLFdBQVc7OzJCQUNJLGFBQWE7O3dCQUNsQixVQUFVOzt5QkFFVixjQUFjOzs7O3NCQUNqQixVQUFVOzs7OzRCQUVKLGlCQUFpQjs7OztxQkFDeEIsU0FBUzs7OztxQkFDd0MsU0FBUzs7QUFJckUsSUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDOzs7O0lBRWpCLGFBQWE7V0FBYixhQUFhOzBCQUFiLGFBQWE7O1NBQ3hCLFdBQVcsR0FBdUIsSUFBSTs7O2VBRDNCLGFBQWE7O1dBSVYsd0JBQ1osT0FBcUIsRUFDckIsTUFBdUIsRUFDdkIsUUFBZ0IsRUFDaEIsU0FBc0MsRUFDdEM7OztBQUNBLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDdkQsWUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGNBQU0sT0FBTywrQkFBOEIsT0FBTyxDQUFDLElBQUksWUFBVSxDQUFDO0FBQ2xFLGNBQU0saUJBQWlCLEdBQ3JCLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FDeEMsK0lBQStJLEdBQy9JLEVBQUUsQ0FBQztBQUNULGNBQU0sV0FBVyxpSEFBK0csaUJBQWlCLEFBQUUsQ0FBQztBQUNwSixjQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7QUFDbkMsdUJBQVcsRUFBWCxXQUFXO0FBQ1gsdUJBQVcsRUFBRSxpQkFBaUIsS0FBSyxFQUFFO1dBQ3RDLENBQUMsQ0FBQztBQUNILGlCQUFPO1NBQ1I7O0FBRUQsY0FBSyxXQUFXLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FB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QUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDL0MsTUFBTTtBQUNMLFlBQU0sT0FBTyxHQUFHLDJCQUEyQixDQUFDO0FBQzVDLFlBQU0sT0FBTyxHQUFHO0FBQ2QsZ0JBQU0sRUFBRSxvQkFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdEQsQ0FBQztBQUNGLFlBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztPQUM5QztBQUNELGFBQU8sV0FBVyxDQUFDO0tBQ3BCOzs7U0FuSlUsYUFBYTs7OztxQkFzSlgsSUFBSSxhQUFhLEVBQUUiLCJmaWxlIjoiL3Jvb3QvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2tlcm5lbC1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMga2VybmVsc3BlY3MgZnJvbSBcImtlcm5lbHNwZWNzXCI7XG5pbXBvcnQgeyBsYXVuY2hTcGVjIH0gZnJvbSBcInNwYXdudGVyYWN0XCI7XG5pbXBvcnQgeyBzaGVsbCB9IGZyb20gXCJlbGVjdHJvblwiO1xuXG5pbXBvcnQgWk1RS2VybmVsIGZyb20gXCIuL3ptcS1rZXJuZWxcIjtcbmltcG9ydCBLZXJuZWwgZnJvbSBcIi4va2VybmVsXCI7XG5cbmltcG9ydCBLZXJuZWxQaWNrZXIgZnJvbSBcIi4va2VybmVsLXBpY2tlclwiO1xuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgeyBnZXRFZGl0b3JEaXJlY3RvcnksIGtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXIsIGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCB0eXBlIHsgQ29ubmVjdGlvbiB9IGZyb20gXCIuL3ptcS1rZXJuZWxcIjtcblxuZXhwb3J0IGNvbnN0IGtzID0ga2VybmVsc3BlY3M7XG5cbmV4cG9ydCBjbGFzcyBLZXJuZWxNYW5hZ2VyIHtcbiAga2VybmVsU3BlY3M6ID9BcnJheTxLZXJuZWxzcGVjPiA9IG51bGw7XG4gIGtlcm5lbFBpY2tlcjogP0tlcm5lbFBpY2tlcjtcblxuICBzdGFydEtlcm5lbEZvcihcbiAgICBncmFtbWFyOiBhdG9tJEdyYW1tYXIsXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgZmlsZVBhdGg6IHN0cmluZyxcbiAgICBvblN0YXJ0ZWQ6IChrZXJuZWw6IFpNUUtlcm5lbCkgPT4gdm9pZFxuICApIHtcbiAgICB0aGlzLmdldEtlcm5lbFNwZWNGb3JHcmFtbWFyKGdyYW1tYXIpLnRoZW4oa2VybmVsU3BlYyA9PiB7XG4gICAgICBpZiAoIWtlcm5lbFNwZWMpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBObyBrZXJuZWwgZm9yIGdyYW1tYXIgXFxgJHtncmFtbWFyLm5hbWV9XFxgIGZvdW5kYDtcbiAgICAgICAgY29uc3QgcHl0aG9uRGVzY3JpcHRpb24gPVxuICAgICAgICAgIGdyYW1tYXIgJiYgL3B5dGhvbi9nLnRlc3QoZ3JhbW1hci5zY29wZU5hbWUpXG4gICAgICAgICAgICA/IFwiXFxuXFxuVG8gZGV0ZWN0IHlvdXIgY3VycmVudCBQeXRob24gaW5zdGFsbCB5b3Ugd2lsbCBuZWVkIHRvIHJ1bjo8cHJlPnB5dGhvbiAtbSBwaXAgaW5zdGFsbCBpcHlrZXJuZWxcXG5weXRob24gLW0gaXB5a2VybmVsIGluc3RhbGwgLS11c2VyPC9wcmU+XCJcbiAgICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBgQ2hlY2sgdGhhdCB0aGUgbGFuZ3VhZ2UgZm9yIHRoaXMgZmlsZSBpcyBzZXQgaW4gQXRvbSBhbmQgdGhhdCB5b3UgaGF2ZSBhIEp1cHl0ZXIga2VybmVsIGluc3RhbGxlZCBmb3IgaXQuJHtweXRob25EZXNjcmlwdGlvbn1gO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwge1xuICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiBweXRob25EZXNjcmlwdGlvbiAhPT0gXCJcIlxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YXJ0S2VybmVsKGtlcm5lbFNwZWMsIGdyYW1tYXIsIGVkaXRvciwgZmlsZVBhdGgsIG9uU3RhcnRlZCk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydEtlcm5lbChcbiAgICBrZXJuZWxTcGVjOiBLZXJuZWxzcGVjLFxuICAgIGdyYW1tYXI6IGF0b20kR3JhbW1hcixcbiAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICBmaWxlUGF0aDogc3RyaW5nLFxuICAgIG9uU3RhcnRlZDogPyhrZXJuZWw6IFpNUUtlcm5lbCkgPT4gdm9pZFxuICApIHtcbiAgICBjb25zdCBkaXNwbGF5TmFtZSA9IGtlcm5lbFNwZWMuZGlzcGxheV9uYW1lO1xuXG4gICAgLy8gaWYga2VybmVsIHN0YXJ0dXAgYWxyZWFkeSBpbiBwcm9ncmVzcyBkb24ndCBzdGFydCBhZGRpdGlvbmFsIGtlcm5lbFxuICAgIGlmIChzdG9yZS5zdGFydGluZ0tlcm5lbHMuZ2V0KGRpc3BsYXlOYW1lKSkgcmV0dXJuO1xuXG4gICAgc3RvcmUuc3RhcnRLZXJuZWwoZGlzcGxheU5hbWUpO1xuXG4gICAgbGV0IGN1cnJlbnRQYXRoID0gZ2V0RWRpdG9yRGlyZWN0b3J5KGVkaXRvcik7XG4gICAgbGV0IHByb2plY3RQYXRoO1xuXG4gICAgbG9nKFwiS2VybmVsTWFuYWdlcjogc3RhcnRLZXJuZWw6XCIsIGRpc3BsYXlOYW1lKTtcblxuICAgIHN3aXRjaCAoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4uc3RhcnREaXJcIikpIHtcbiAgICAgIGNhc2UgXCJmaXJzdFByb2plY3REaXJcIjpcbiAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicHJvamVjdERpck9mRmlsZVwiOlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChjdXJyZW50UGF0aClbMF07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IGtlcm5lbFN0YXJ0RGlyID0gcHJvamVjdFBhdGggIT0gbnVsbCA/IHByb2plY3RQYXRoIDogY3VycmVudFBhdGg7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDoga2VybmVsU3RhcnREaXIsXG4gICAgICBzdGRpbzogW1wiaWdub3JlXCIsIFwicGlwZVwiLCBcInBpcGVcIl1cbiAgICB9O1xuXG4gICAgY29uc3QgdHJhbnNwb3J0ID0gbmV3IFpNUUtlcm5lbChrZXJuZWxTcGVjLCBncmFtbWFyLCBvcHRpb25zLCAoKSA9PiB7XG4gICAgICBjb25zdCBrZXJuZWwgPSBuZXcgS2VybmVsKHRyYW5zcG9ydCk7XG4gICAgICBzdG9yZS5uZXdLZXJuZWwoa2VybmVsLCBmaWxlUGF0aCwgZWRpdG9yLCBncmFtbWFyKTtcbiAgICAgIGlmIChvblN0YXJ0ZWQpIG9uU3RhcnRlZChrZXJuZWwpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgdXBkYXRlKCkge1xuICAgIGNvbnN0IGtlcm5lbFNwZWNzID0gYXdhaXQga3MuZmluZEFsbCgpO1xuICAgIHRoaXMua2VybmVsU3BlY3MgPSBfLnNvcnRCeShfLm1hcChrZXJuZWxTcGVjcywgXCJzcGVjXCIpLCBzcGVjID0+IHNwZWMuZGlzcGxheV9uYW1lKTtcbiAgICByZXR1cm4gdGhpcy5rZXJuZWxTcGVjcztcbiAgfVxuXG4gIGFzeW5jIGdldEFsbEtlcm5lbFNwZWNzKGdyYW1tYXI6ID9hdG9tJEdyYW1tYXIpIHtcbiAgICBpZiAodGhpcy5rZXJuZWxTcGVjcykgcmV0dXJuIHRoaXMua2VybmVsU3BlY3M7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlS2VybmVsU3BlY3MoZ3JhbW1hcik7XG4gIH1cblxuICBhc3luYyBnZXRBbGxLZXJuZWxTcGVjc0ZvckdyYW1tYXIoZ3JhbW1hcjogP2F0b20kR3JhbW1hcikge1xuICAgIGlmICghZ3JhbW1hcikgcmV0dXJuIFtdO1xuXG4gICAgY29uc3Qga2VybmVsU3BlY3MgPSBhd2FpdCB0aGlzLmdldEFsbEtlcm5lbFNwZWNzKGdyYW1tYXIpO1xuICAgIHJldHVybiBrZXJuZWxTcGVjcy5maWx0ZXIoc3BlYyA9PiBrZXJuZWxTcGVjUHJvdmlkZXNHcmFtbWFyKHNwZWMsIGdyYW1tYXIpKTtcbiAgfVxuXG4gIGFzeW5jIGdldEtlcm5lbFNwZWNGb3JHcmFtbWFyKGdyYW1tYXI6IGF0b20kR3JhbW1hcikge1xuICAgIGNvbnN0IGtlcm5lbFNwZWNzID0gYXdhaXQgdGhpcy5nZXRBbGxLZXJuZWxTcGVjc0ZvckdyYW1tYXIoZ3JhbW1hcik7XG4gICAgaWYgKGtlcm5lbFNwZWNzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4ga2VybmVsU3BlY3NbMF07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMua2VybmVsUGlja2VyKSB7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci5rZXJuZWxTcGVjcyA9IGtlcm5lbFNwZWNzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlciA9IG5ldyBLZXJuZWxQaWNrZXIoa2VybmVsU3BlY3MpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmICghdGhpcy5rZXJuZWxQaWNrZXIpIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgdGhpcy5rZXJuZWxQaWNrZXIub25Db25maXJtZWQgPSBrZXJuZWxTcGVjID0+IHJlc29sdmUoa2VybmVsU3BlYyk7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci50b2dnbGUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUtlcm5lbFNwZWNzKGdyYW1tYXI6ID9hdG9tJEdyYW1tYXIpIHtcbiAgICBjb25zdCBrZXJuZWxTcGVjcyA9IGF3YWl0IHRoaXMudXBkYXRlKCk7XG5cbiAgICBpZiAoa2VybmVsU3BlY3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gXCJObyBLZXJuZWxzIEluc3RhbGxlZFwiO1xuXG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICBcIk5vIGtlcm5lbHMgYXJlIGluc3RhbGxlZCBvbiB5b3VyIHN5c3RlbSBzbyB5b3Ugd2lsbCBub3QgYmUgYWJsZSB0byBleGVjdXRlIGNvZGUgaW4gYW55IGxhbmd1YWdlLlwiLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiSW5zdGFsbCBJbnN0cnVjdGlvbnNcIixcbiAgICAgICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+XG4gICAgICAgICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChcbiAgICAgICAgICAgICAgICBcImh0dHBzOi8vbnRlcmFjdC5naXRib29rcy5pby9oeWRyb2dlbi9kb2NzL0luc3RhbGxhdGlvbi5odG1sXCJcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJQb3B1bGFyIEtlcm5lbHNcIixcbiAgICAgICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IHNoZWxsLm9wZW5FeHRlcm5hbChcImh0dHBzOi8vbnRlcmFjdC5pby9rZXJuZWxzXCIpXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkFsbCBLZXJuZWxzXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PlxuICAgICAgICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoXG4gICAgICAgICAgICAgICAgXCJodHRwczovL2dpdGh1Yi5jb20vanVweXRlci9qdXB5dGVyL3dpa2kvSnVweXRlci1rZXJuZWxzXCJcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IFwiSHlkcm9nZW4gS2VybmVscyB1cGRhdGVkOlwiO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZGV0YWlsOiBfLm1hcChrZXJuZWxTcGVjcywgXCJkaXNwbGF5X25hbWVcIikuam9pbihcIlxcblwiKVxuICAgICAgfTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4ga2VybmVsU3BlY3M7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEtlcm5lbE1hbmFnZXIoKTtcbiJdfQ==