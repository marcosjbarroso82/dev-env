Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _kernelManager = require("./kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var basicCommands = [{ name: "Interrupt", value: "interrupt-kernel" }, { name: "Restart", value: "restart-kernel" }, { name: "Shut Down", value: "shutdown-kernel" }];

var wsKernelCommands = [{ name: "Rename session for", value: "rename-kernel" }, { name: "Disconnect from", value: "disconnect-kernel" }];

var SignalListView = (function () {
  function SignalListView() {
    var _this = this;

    _classCallCheck(this, SignalListView);

    this.onConfirmed = null;
    this.selectListView = new _atomSelectList2["default"]({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.name;
      },
      elementForItem: function elementForItem(item) {
        var element = document.createElement("li");
        element.textContent = item.name;
        return element;
      },
      didConfirmSelection: function didConfirmSelection(item) {
        (0, _utils.log)("Selected command:", item);
        if (_this.onConfirmed) _this.onConfirmed(item);
        _this.cancel();
      },
      didCancelSelection: function didCancelSelection() {
        return _this.cancel();
      },
      emptyMessage: "No running kernels for this file type."
    });
  }

  _createClass(SignalListView, [{
    key: "toggle",
    value: _asyncToGenerator(function* () {
      if (this.panel != null) {
        this.cancel();
      }

      var kernel = _store2["default"].kernel;
      if (!kernel) return;
      var commands = kernel.transport instanceof _wsKernel2["default"] ? [].concat(basicCommands, wsKernelCommands) : basicCommands;

      var listItems = commands.map(function (command) {
        return {
          name: command.name + " " + kernel.kernelSpec.display_name + " kernel",
          command: command.value
        };
      });

      yield this.selectListView.update({ items: listItems });
      this.attach();
    })
  }, {
    key: "attach",
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      if (this.panel == null) this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      this.selectListView.focus();
      this.selectListView.reset();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.cancel();
      return this.selectListView.destroy();
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this.panel != null) {
        this.panel.destroy();
      }
      this.panel = null;
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    }
  }]);

  return SignalListView;
})();

exports["default"] = SignalListView;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zaWduYWwtbGlzdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O3dCQUV4QixhQUFhOzs7OzZCQUNSLGtCQUFrQjs7OztxQkFDeEIsU0FBUzs7cUJBQ1gsU0FBUzs7OztBQUUzQixJQUFNLGFBQWEsR0FBRyxDQUNwQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLEVBQ2hELEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsRUFDNUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxDQUNoRCxDQUFDOztBQUVGLElBQU0sZ0JBQWdCLEdBQUcsQ0FDdkIsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsQ0FDeEQsQ0FBQzs7SUFFbUIsY0FBYztBQU10QixXQU5RLGNBQWMsR0FNbkI7OzswQkFOSyxjQUFjOztBQU8vQixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFJLENBQUMsY0FBYyxHQUFHLGdDQUFtQjtBQUN2QyxvQkFBYyxFQUFFLENBQUMsYUFBYSxDQUFDO0FBQy9CLFdBQUssRUFBRSxFQUFFO0FBQ1Qsc0JBQWdCLEVBQUUsMEJBQUEsSUFBSTtlQUFJLElBQUksQ0FBQyxJQUFJO09BQUE7QUFDbkMsb0JBQWMsRUFBRSx3QkFBQSxJQUFJLEVBQUk7QUFDdEIsWUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxlQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDaEMsZUFBTyxPQUFPLENBQUM7T0FDaEI7QUFDRCx5QkFBbUIsRUFBRSw2QkFBQSxJQUFJLEVBQUk7QUFDM0Isd0JBQUksbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsWUFBSSxNQUFLLFdBQVcsRUFBRSxNQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxjQUFLLE1BQU0sRUFBRSxDQUFDO09BQ2Y7QUFDRCx3QkFBa0IsRUFBRTtlQUFNLE1BQUssTUFBTSxFQUFFO09BQUE7QUFDdkMsa0JBQVksRUFBRSx3Q0FBd0M7S0FDdkQsQ0FBQyxDQUFDO0dBQ0o7O2VBekJrQixjQUFjOzs2QkEyQnJCLGFBQUc7QUFDYixVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNmOztBQUVELFVBQU0sTUFBTSxHQUFHLG1CQUFNLE1BQU0sQ0FBQztBQUM1QixVQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87QUFDcEIsVUFBTSxRQUFRLEdBQ1osTUFBTSxDQUFDLFNBQVMsaUNBQW9CLGFBQzVCLGFBQWEsRUFBSyxnQkFBZ0IsSUFDdEMsYUFBYSxDQUFDOztBQUVwQixVQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTztlQUFLO0FBQ3pDLGNBQUksRUFBSyxPQUFPLENBQUMsSUFBSSxTQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxZQUFTO0FBQ2hFLGlCQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUs7U0FDdkI7T0FBQyxDQUFDLENBQUM7O0FBRUosWUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksQ0FBQyx3QkFBd0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO0FBQ3ZELFVBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDM0UsVUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM1QixVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzdCOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNkLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7QUFDRCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtBQUNqQyxZQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEMsWUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztPQUN0QztLQUNGOzs7U0F0RWtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zaWduYWwtbGlzdC12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gXCJhdG9tLXNlbGVjdC1saXN0XCI7XG5cbmltcG9ydCBXU0tlcm5lbCBmcm9tIFwiLi93cy1rZXJuZWxcIjtcbmltcG9ydCBrZXJuZWxNYW5hZ2VyIGZyb20gXCIuL2tlcm5lbC1tYW5hZ2VyXCI7XG5pbXBvcnQgeyBsb2cgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5cbmNvbnN0IGJhc2ljQ29tbWFuZHMgPSBbXG4gIHsgbmFtZTogXCJJbnRlcnJ1cHRcIiwgdmFsdWU6IFwiaW50ZXJydXB0LWtlcm5lbFwiIH0sXG4gIHsgbmFtZTogXCJSZXN0YXJ0XCIsIHZhbHVlOiBcInJlc3RhcnQta2VybmVsXCIgfSxcbiAgeyBuYW1lOiBcIlNodXQgRG93blwiLCB2YWx1ZTogXCJzaHV0ZG93bi1rZXJuZWxcIiB9XG5dO1xuXG5jb25zdCB3c0tlcm5lbENvbW1hbmRzID0gW1xuICB7IG5hbWU6IFwiUmVuYW1lIHNlc3Npb24gZm9yXCIsIHZhbHVlOiBcInJlbmFtZS1rZXJuZWxcIiB9LFxuICB7IG5hbWU6IFwiRGlzY29ubmVjdCBmcm9tXCIsIHZhbHVlOiBcImRpc2Nvbm5lY3Qta2VybmVsXCIgfVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2lnbmFsTGlzdFZpZXcge1xuICBvbkNvbmZpcm1lZDogPyhjb21tYW5kOiB7IGNvbW1hbmQ6IHN0cmluZyB9KSA9PiB2b2lkO1xuICBwYW5lbDogP2F0b20kUGFuZWw7XG4gIHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudDogP0hUTUxFbGVtZW50O1xuICBzZWxlY3RMaXN0VmlldzogU2VsZWN0TGlzdFZpZXc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5vbkNvbmZpcm1lZCA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtc0NsYXNzTGlzdDogW1wibWFyay1hY3RpdmVcIl0sXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBpdGVtID0+IGl0ZW0ubmFtZSxcbiAgICAgIGVsZW1lbnRGb3JJdGVtOiBpdGVtID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGl0ZW0ubmFtZTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9LFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogaXRlbSA9PiB7XG4gICAgICAgIGxvZyhcIlNlbGVjdGVkIGNvbW1hbmQ6XCIsIGl0ZW0pO1xuICAgICAgICBpZiAodGhpcy5vbkNvbmZpcm1lZCkgdGhpcy5vbkNvbmZpcm1lZChpdGVtKTtcbiAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgIH0sXG4gICAgICBkaWRDYW5jZWxTZWxlY3Rpb246ICgpID0+IHRoaXMuY2FuY2VsKCksXG4gICAgICBlbXB0eU1lc3NhZ2U6IFwiTm8gcnVubmluZyBrZXJuZWxzIGZvciB0aGlzIGZpbGUgdHlwZS5cIlxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLnBhbmVsICE9IG51bGwpIHtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfVxuXG4gICAgY29uc3Qga2VybmVsID0gc3RvcmUua2VybmVsO1xuICAgIGlmICgha2VybmVsKSByZXR1cm47XG4gICAgY29uc3QgY29tbWFuZHMgPVxuICAgICAga2VybmVsLnRyYW5zcG9ydCBpbnN0YW5jZW9mIFdTS2VybmVsXG4gICAgICAgID8gWy4uLmJhc2ljQ29tbWFuZHMsIC4uLndzS2VybmVsQ29tbWFuZHNdXG4gICAgICAgIDogYmFzaWNDb21tYW5kcztcblxuICAgIGNvbnN0IGxpc3RJdGVtcyA9IGNvbW1hbmRzLm1hcChjb21tYW5kID0+ICh7XG4gICAgICBuYW1lOiBgJHtjb21tYW5kLm5hbWV9ICR7a2VybmVsLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lfSBrZXJuZWxgLFxuICAgICAgY29tbWFuZDogY29tbWFuZC52YWx1ZVxuICAgIH0pKTtcblxuICAgIGF3YWl0IHRoaXMuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgaXRlbXM6IGxpc3RJdGVtcyB9KTtcbiAgICB0aGlzLmF0dGFjaCgpO1xuICB9XG5cbiAgYXR0YWNoKCkge1xuICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICBpZiAodGhpcy5wYW5lbCA9PSBudWxsKVxuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzLnNlbGVjdExpc3RWaWV3IH0pO1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcuZm9jdXMoKTtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LnJlc2V0KCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0TGlzdFZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIGlmICh0aGlzLnBhbmVsICE9IG51bGwpIHtcbiAgICAgIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLnBhbmVsID0gbnVsbDtcbiAgICBpZiAodGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=