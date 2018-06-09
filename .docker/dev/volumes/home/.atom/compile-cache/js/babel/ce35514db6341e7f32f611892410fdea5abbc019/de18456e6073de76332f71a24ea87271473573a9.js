Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _kernelTransport = require("./kernel-transport");

var _kernelTransport2 = _interopRequireDefault(_kernelTransport);

var _inputView = require("./input-view");

var _inputView2 = _interopRequireDefault(_inputView);

var _utils = require("./utils");

var WSKernel = (function (_KernelTransport) {
  _inherits(WSKernel, _KernelTransport);

  function WSKernel(gatewayName, kernelSpec, grammar, session) {
    var _this = this;

    _classCallCheck(this, WSKernel);

    _get(Object.getPrototypeOf(WSKernel.prototype), "constructor", this).call(this, kernelSpec, grammar);
    this.session = session;
    this.gatewayName = gatewayName;

    this.session.statusChanged.connect(function () {
      return _this.setExecutionState(_this.session.status);
    });
    this.setExecutionState(this.session.status); // Set initial status correctly
  }

  _createClass(WSKernel, [{
    key: "interrupt",
    value: function interrupt() {
      this.session.kernel.interrupt();
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      this.session.kernel.shutdown();
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      var future = this.session.kernel.restart();
      future.then(function () {
        if (onRestarted) onRestarted();
      });
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      var future = this.session.kernel.requestExecute({ code: code });

      future.onIOPub = function (message) {
        (0, _utils.log)("WSKernel: execute:", message);
        onResults(message, "iopub");
      };

      future.onReply = function (message) {
        return onResults(message, "shell");
      };
      future.onStdin = function (message) {
        return onResults(message, "stdin");
      };
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      this.session.kernel.requestComplete({
        code: code,
        cursor_pos: code.length
      }).then(function (message) {
        return onResults(message, "shell");
      });
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      this.session.kernel.requestInspect({
        code: code,
        cursor_pos: cursorPos,
        detail_level: 0
      }).then(function (message) {
        return onResults(message, "shell");
      });
    }
  }, {
    key: "inputReply",
    value: function inputReply(input) {
      this.session.kernel.sendInputReply({ value: input });
    }
  }, {
    key: "promptRename",
    value: function promptRename() {
      var _this2 = this;

      var view = new _inputView2["default"]({
        prompt: "Name your current session",
        defaultText: this.session.path,
        allowCancel: true
      }, function (input) {
        return _this2.session.setPath(input);
      });

      view.attach();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("WSKernel: destroying jupyter-js-services Session");
      this.session.dispose();
      _get(Object.getPrototypeOf(WSKernel.prototype), "destroy", this).call(this);
    }
  }]);

  return WSKernel;
})(_kernelTransport2["default"]);

exports["default"] = WSKernel;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7K0JBRTRCLG9CQUFvQjs7Ozt5QkFFMUIsY0FBYzs7OztxQkFDaEIsU0FBUzs7SUFJUixRQUFRO1lBQVIsUUFBUTs7QUFJaEIsV0FKUSxRQUFRLENBS3pCLFdBQW1CLEVBQ25CLFVBQXNCLEVBQ3RCLE9BQXFCLEVBQ3JCLE9BQWdCLEVBQ2hCOzs7MEJBVGlCLFFBQVE7O0FBVXpCLCtCQVZpQixRQUFRLDZDQVVuQixVQUFVLEVBQUUsT0FBTyxFQUFFO0FBQzNCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDOztBQUUvQixRQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7YUFDakMsTUFBSyxpQkFBaUIsQ0FBQyxNQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FBQSxDQUM1QyxDQUFDO0FBQ0YsUUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDN0M7O2VBbEJrQixRQUFROztXQW9CbEIscUJBQUc7QUFDVixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNqQzs7O1dBRU8sb0JBQUc7QUFDVCxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNoQzs7O1dBRU0saUJBQUMsV0FBc0IsRUFBRTtBQUM5QixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QyxZQUFNLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDaEIsWUFBSSxXQUFXLEVBQUUsV0FBVyxFQUFFLENBQUM7T0FDaEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLGlCQUFDLElBQVksRUFBRSxTQUEwQixFQUFFO0FBQ2hELFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBSixJQUFJLEVBQUUsQ0FBQyxDQUFDOztBQUU1RCxZQUFNLENBQUMsT0FBTyxHQUFHLFVBQUMsT0FBTyxFQUFjO0FBQ3JDLHdCQUFJLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLGlCQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQzdCLENBQUM7O0FBRUYsWUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFDLE9BQU87ZUFBYyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztPQUFBLENBQUM7QUFDbkUsWUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFDLE9BQU87ZUFBYyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztPQUFBLENBQUM7S0FDcEU7OztXQUVPLGtCQUFDLElBQVksRUFBRSxTQUEwQixFQUFFO0FBQ2pELFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUNoQixlQUFlLENBQUM7QUFDZixZQUFJLEVBQUosSUFBSTtBQUNKLGtCQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU07T0FDeEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFDLE9BQU87ZUFBYyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQztLQUM1RDs7O1dBRU0saUJBQUMsSUFBWSxFQUFFLFNBQWlCLEVBQUUsU0FBMEIsRUFBRTtBQUNuRSxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDaEIsY0FBYyxDQUFDO0FBQ2QsWUFBSSxFQUFKLElBQUk7QUFDSixrQkFBVSxFQUFFLFNBQVM7QUFDckIsb0JBQVksRUFBRSxDQUFDO09BQ2hCLENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBQyxPQUFPO2VBQWMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDNUQ7OztXQUVTLG9CQUFDLEtBQWEsRUFBRTtBQUN4QixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN0RDs7O1dBRVcsd0JBQUc7OztBQUNiLFVBQU0sSUFBSSxHQUFHLDJCQUNYO0FBQ0UsY0FBTSxFQUFFLDJCQUEyQjtBQUNuQyxtQkFBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtBQUM5QixtQkFBVyxFQUFFLElBQUk7T0FDbEIsRUFDRCxVQUFDLEtBQUs7ZUFBYSxPQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO09BQUEsQ0FDL0MsQ0FBQzs7QUFFRixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRU0sbUJBQUc7QUFDUixzQkFBSSxrREFBa0QsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsaUNBdEZpQixRQUFRLHlDQXNGVDtLQUNqQjs7O1NBdkZrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvcm9vdC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvd3Mta2VybmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IEtlcm5lbFRyYW5zcG9ydCBmcm9tIFwiLi9rZXJuZWwtdHJhbnNwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IFJlc3VsdHNDYWxsYmFjayB9IGZyb20gXCIuL2tlcm5lbC10cmFuc3BvcnRcIjtcbmltcG9ydCBJbnB1dFZpZXcgZnJvbSBcIi4vaW5wdXQtdmlld1wiO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgeyBTZXNzaW9uIH0gZnJvbSBcIkBqdXB5dGVybGFiL3NlcnZpY2VzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdTS2VybmVsIGV4dGVuZHMgS2VybmVsVHJhbnNwb3J0IHtcbiAgc2Vzc2lvbjogU2Vzc2lvbjtcbiAgZ2F0ZXdheU5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBnYXRld2F5TmFtZTogc3RyaW5nLFxuICAgIGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsXG4gICAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyLFxuICAgIHNlc3Npb246IFNlc3Npb25cbiAgKSB7XG4gICAgc3VwZXIoa2VybmVsU3BlYywgZ3JhbW1hcik7XG4gICAgdGhpcy5zZXNzaW9uID0gc2Vzc2lvbjtcbiAgICB0aGlzLmdhdGV3YXlOYW1lID0gZ2F0ZXdheU5hbWU7XG5cbiAgICB0aGlzLnNlc3Npb24uc3RhdHVzQ2hhbmdlZC5jb25uZWN0KCgpID0+XG4gICAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKHRoaXMuc2Vzc2lvbi5zdGF0dXMpXG4gICAgKTtcbiAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKHRoaXMuc2Vzc2lvbi5zdGF0dXMpOyAvLyBTZXQgaW5pdGlhbCBzdGF0dXMgY29ycmVjdGx5XG4gIH1cblxuICBpbnRlcnJ1cHQoKSB7XG4gICAgdGhpcy5zZXNzaW9uLmtlcm5lbC5pbnRlcnJ1cHQoKTtcbiAgfVxuXG4gIHNodXRkb3duKCkge1xuICAgIHRoaXMuc2Vzc2lvbi5rZXJuZWwuc2h1dGRvd24oKTtcbiAgfVxuXG4gIHJlc3RhcnQob25SZXN0YXJ0ZWQ6ID9GdW5jdGlvbikge1xuICAgIGNvbnN0IGZ1dHVyZSA9IHRoaXMuc2Vzc2lvbi5rZXJuZWwucmVzdGFydCgpO1xuICAgIGZ1dHVyZS50aGVuKCgpID0+IHtcbiAgICAgIGlmIChvblJlc3RhcnRlZCkgb25SZXN0YXJ0ZWQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjaykge1xuICAgIGNvbnN0IGZ1dHVyZSA9IHRoaXMuc2Vzc2lvbi5rZXJuZWwucmVxdWVzdEV4ZWN1dGUoeyBjb2RlIH0pO1xuXG4gICAgZnV0dXJlLm9uSU9QdWIgPSAobWVzc2FnZTogTWVzc2FnZSkgPT4ge1xuICAgICAgbG9nKFwiV1NLZXJuZWw6IGV4ZWN1dGU6XCIsIG1lc3NhZ2UpO1xuICAgICAgb25SZXN1bHRzKG1lc3NhZ2UsIFwiaW9wdWJcIik7XG4gICAgfTtcblxuICAgIGZ1dHVyZS5vblJlcGx5ID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IG9uUmVzdWx0cyhtZXNzYWdlLCBcInNoZWxsXCIpO1xuICAgIGZ1dHVyZS5vblN0ZGluID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IG9uUmVzdWx0cyhtZXNzYWdlLCBcInN0ZGluXCIpO1xuICB9XG5cbiAgY29tcGxldGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjaykge1xuICAgIHRoaXMuc2Vzc2lvbi5rZXJuZWxcbiAgICAgIC5yZXF1ZXN0Q29tcGxldGUoe1xuICAgICAgICBjb2RlLFxuICAgICAgICBjdXJzb3JfcG9zOiBjb2RlLmxlbmd0aFxuICAgICAgfSlcbiAgICAgIC50aGVuKChtZXNzYWdlOiBNZXNzYWdlKSA9PiBvblJlc3VsdHMobWVzc2FnZSwgXCJzaGVsbFwiKSk7XG4gIH1cblxuICBpbnNwZWN0KGNvZGU6IHN0cmluZywgY3Vyc29yUG9zOiBudW1iZXIsIG9uUmVzdWx0czogUmVzdWx0c0NhbGxiYWNrKSB7XG4gICAgdGhpcy5zZXNzaW9uLmtlcm5lbFxuICAgICAgLnJlcXVlc3RJbnNwZWN0KHtcbiAgICAgICAgY29kZSxcbiAgICAgICAgY3Vyc29yX3BvczogY3Vyc29yUG9zLFxuICAgICAgICBkZXRhaWxfbGV2ZWw6IDBcbiAgICAgIH0pXG4gICAgICAudGhlbigobWVzc2FnZTogTWVzc2FnZSkgPT4gb25SZXN1bHRzKG1lc3NhZ2UsIFwic2hlbGxcIikpO1xuICB9XG5cbiAgaW5wdXRSZXBseShpbnB1dDogc3RyaW5nKSB7XG4gICAgdGhpcy5zZXNzaW9uLmtlcm5lbC5zZW5kSW5wdXRSZXBseSh7IHZhbHVlOiBpbnB1dCB9KTtcbiAgfVxuXG4gIHByb21wdFJlbmFtZSgpIHtcbiAgICBjb25zdCB2aWV3ID0gbmV3IElucHV0VmlldyhcbiAgICAgIHtcbiAgICAgICAgcHJvbXB0OiBcIk5hbWUgeW91ciBjdXJyZW50IHNlc3Npb25cIixcbiAgICAgICAgZGVmYXVsdFRleHQ6IHRoaXMuc2Vzc2lvbi5wYXRoLFxuICAgICAgICBhbGxvd0NhbmNlbDogdHJ1ZVxuICAgICAgfSxcbiAgICAgIChpbnB1dDogc3RyaW5nKSA9PiB0aGlzLnNlc3Npb24uc2V0UGF0aChpbnB1dClcbiAgICApO1xuXG4gICAgdmlldy5hdHRhY2goKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgbG9nKFwiV1NLZXJuZWw6IGRlc3Ryb3lpbmcganVweXRlci1qcy1zZXJ2aWNlcyBTZXNzaW9uXCIpO1xuICAgIHRoaXMuc2Vzc2lvbi5kaXNwb3NlKCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=