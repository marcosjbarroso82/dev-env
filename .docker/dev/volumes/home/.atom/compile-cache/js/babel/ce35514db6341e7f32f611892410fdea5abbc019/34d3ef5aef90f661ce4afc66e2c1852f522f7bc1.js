Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _jmp = require("jmp");

var _uuidV4 = require("uuid/v4");

var _uuidV42 = _interopRequireDefault(_uuidV4);

var _spawnteract = require("spawnteract");

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _kernelTransport = require("./kernel-transport");

var _kernelTransport2 = _interopRequireDefault(_kernelTransport);

var _utils = require("./utils");

var ZMQKernel = (function (_KernelTransport) {
  _inherits(ZMQKernel, _KernelTransport);

  function ZMQKernel(kernelSpec, grammar, options, onStarted) {
    var _this = this;

    _classCallCheck(this, ZMQKernel);

    _get(Object.getPrototypeOf(ZMQKernel.prototype), "constructor", this).call(this, kernelSpec, grammar);
    this.executionCallbacks = {};
    this.options = options || {};

    (0, _spawnteract.launchSpec)(kernelSpec, options).then(function (_ref) {
      var config = _ref.config;
      var connectionFile = _ref.connectionFile;
      var spawn = _ref.spawn;

      _this.connection = config;
      _this.connectionFile = connectionFile;
      _this.kernelProcess = spawn;

      _this.monitorNotifications(spawn);

      _this.connect(function () {
        _this._executeStartupCode();

        if (onStarted) onStarted(_this);
      });
    });
  }

  _createClass(ZMQKernel, [{
    key: "connect",
    value: function connect(done) {
      var scheme = this.connection.signature_scheme.slice("hmac-".length);
      var key = this.connection.key;

      this.shellSocket = new _jmp.Socket("dealer", scheme, key);
      this.controlSocket = new _jmp.Socket("dealer", scheme, key);
      this.stdinSocket = new _jmp.Socket("dealer", scheme, key);
      this.ioSocket = new _jmp.Socket("sub", scheme, key);

      var id = (0, _uuidV42["default"])();
      this.shellSocket.identity = "dealer" + id;
      this.controlSocket.identity = "control" + id;
      this.stdinSocket.identity = "dealer" + id;
      this.ioSocket.identity = "sub" + id;

      var address = this.connection.transport + "://" + this.connection.ip + ":";
      this.shellSocket.connect(address + this.connection.shell_port);
      this.controlSocket.connect(address + this.connection.control_port);
      this.ioSocket.connect(address + this.connection.iopub_port);
      this.ioSocket.subscribe("");
      this.stdinSocket.connect(address + this.connection.stdin_port);

      this.shellSocket.on("message", this.onShellMessage.bind(this));
      this.ioSocket.on("message", this.onIOMessage.bind(this));
      this.stdinSocket.on("message", this.onStdinMessage.bind(this));

      this.monitor(done);
    }
  }, {
    key: "monitorNotifications",
    value: function monitorNotifications(childProcess) {
      var _this2 = this;

      childProcess.stdout.on("data", function (data) {
        data = data.toString();

        if (atom.config.get("Hydrogen.kernelNotifications")) {
          atom.notifications.addInfo(_this2.kernelSpec.display_name, {
            description: data,
            dismissable: true
          });
        } else {
          (0, _utils.log)("ZMQKernel: stdout:", data);
        }
      });

      childProcess.stderr.on("data", function (data) {
        atom.notifications.addError(_this2.kernelSpec.display_name, {
          description: data.toString(),
          dismissable: true
        });
      });
    }
  }, {
    key: "monitor",
    value: function monitor(done) {
      var _this3 = this;

      try {
        (function () {
          var socketNames = ["shellSocket", "controlSocket", "ioSocket"];

          var waitGroup = socketNames.length;

          var onConnect = function onConnect(_ref2) {
            var socketName = _ref2.socketName;
            var socket = _ref2.socket;

            (0, _utils.log)("ZMQKernel: " + socketName + " connected");
            socket.unmonitor();

            waitGroup--;
            if (waitGroup === 0) {
              (0, _utils.log)("ZMQKernel: all main sockets connected");
              _this3.setExecutionState("idle");
              if (done) done();
            }
          };

          var monitor = function monitor(socketName, socket) {
            (0, _utils.log)("ZMQKernel: monitor " + socketName);
            socket.on("connect", onConnect.bind(_this3, { socketName: socketName, socket: socket }));
            socket.monitor();
          };

          monitor("shellSocket", _this3.shellSocket);
          monitor("controlSocket", _this3.controlSocket);
          monitor("ioSocket", _this3.ioSocket);
        })();
      } catch (err) {
        console.error("ZMQKernel:", err);
      }
    }
  }, {
    key: "interrupt",
    value: function interrupt() {
      if (process.platform === "win32") {
        atom.notifications.addWarning("Cannot interrupt this kernel", {
          detail: "Kernel interruption is currently not supported in Windows."
        });
      } else {
        (0, _utils.log)("ZMQKernel: sending SIGINT");
        this.kernelProcess.kill("SIGINT");
      }
    }
  }, {
    key: "_kill",
    value: function _kill() {
      (0, _utils.log)("ZMQKernel: sending SIGKILL");
      this.kernelProcess.kill("SIGKILL");
    }
  }, {
    key: "_executeStartupCode",
    value: function _executeStartupCode() {
      var displayName = this.kernelSpec.display_name;
      var startupCode = _config2["default"].getJson("startupCode")[displayName];
      if (startupCode) {
        (0, _utils.log)("KernelManager: Executing startup code:", startupCode);
        startupCode = startupCode + " \n";
        this.execute(startupCode, function (message, channel) {});
      }
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      this._socketShutdown();
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      this._socketRestart(onRestarted);
    }
  }, {
    key: "_socketShutdown",
    value: function _socketShutdown() {
      var restart = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var requestId = "shutdown_" + (0, _uuidV42["default"])();
      var message = this._createMessage("shutdown_request", requestId);

      message.content = { restart: restart };

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "_socketRestart",
    value: function _socketRestart(onRestarted) {
      if (this.executionState === "restarting") {
        return;
      }
      this.setExecutionState("restarting");
      this._socketShutdown(true);
      this._kill();

      var _launchSpecFromConnectionInfo = (0, _spawnteract.launchSpecFromConnectionInfo)(this.kernelSpec, this.connection, this.connectionFile, this.options);

      var spawn = _launchSpecFromConnectionInfo.spawn;

      this.kernelProcess = spawn;
      this.monitor(function () {
        if (onRestarted) onRestarted();
      });
    }

    // onResults is a callback that may be called multiple times
    // as results come in from the kernel
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      (0, _utils.log)("ZMQKernel.execute:", code);
      var requestId = "execute_" + (0, _uuidV42["default"])();

      var message = this._createMessage("execute_request", requestId);

      message.content = {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: true
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      (0, _utils.log)("ZMQKernel.complete:", code);

      var requestId = "complete_" + (0, _uuidV42["default"])();

      var message = this._createMessage("complete_request", requestId);

      message.content = {
        code: code,
        text: code,
        line: code,
        cursor_pos: code.length
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      (0, _utils.log)("ZMQKernel.inspect:", code, cursorPos);

      var requestId = "inspect_" + (0, _uuidV42["default"])();

      var message = this._createMessage("inspect_request", requestId);

      message.content = {
        code: code,
        cursor_pos: cursorPos,
        detail_level: 0
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "inputReply",
    value: function inputReply(input) {
      var requestId = "input_reply_" + (0, _uuidV42["default"])();

      var message = this._createMessage("input_reply", requestId);

      message.content = { value: input };

      this.stdinSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "onShellMessage",
    value: function onShellMessage(message) {
      (0, _utils.log)("shell message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (callback) {
        callback(message, "shell");
      }
    }
  }, {
    key: "onStdinMessage",
    value: function onStdinMessage(message) {
      (0, _utils.log)("stdin message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      // input_request messages are attributable to particular execution requests,
      // and should pass through the middleware stack to allow plugins to see them
      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (callback) {
        callback(message, "stdin");
      }
    }
  }, {
    key: "onIOMessage",
    value: function onIOMessage(message) {
      (0, _utils.log)("IO message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_type = message.header.msg_type;

      if (msg_type === "status") {
        var _status = message.content.execution_state;
        this.setExecutionState(_status);
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (callback) {
        callback(message, "iopub");
      }
    }
  }, {
    key: "_isValidMessage",
    value: function _isValidMessage(message) {
      if (!message) {
        (0, _utils.log)("Invalid message: null");
        return false;
      }

      if (!message.content) {
        (0, _utils.log)("Invalid message: Missing content");
        return false;
      }

      if (message.content.execution_state === "starting") {
        // Kernels send a starting status message with an empty parent_header
        (0, _utils.log)("Dropped starting status IO message");
        return false;
      }

      if (!message.parent_header) {
        (0, _utils.log)("Invalid message: Missing parent_header");
        return false;
      }

      if (!message.parent_header.msg_id) {
        (0, _utils.log)("Invalid message: Missing parent_header.msg_id");
        return false;
      }

      if (!message.parent_header.msg_type) {
        (0, _utils.log)("Invalid message: Missing parent_header.msg_type");
        return false;
      }

      if (!message.header) {
        (0, _utils.log)("Invalid message: Missing header");
        return false;
      }

      if (!message.header.msg_id) {
        (0, _utils.log)("Invalid message: Missing header.msg_id");
        return false;
      }

      if (!message.header.msg_type) {
        (0, _utils.log)("Invalid message: Missing header.msg_type");
        return false;
      }

      return true;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("ZMQKernel: destroy:", this);

      this.shutdown();

      this._kill();
      _fs2["default"].unlinkSync(this.connectionFile);

      this.shellSocket.close();
      this.controlSocket.close();
      this.ioSocket.close();
      this.stdinSocket.close();

      _get(Object.getPrototypeOf(ZMQKernel.prototype), "destroy", this).call(this);
    }
  }, {
    key: "_getUsername",
    value: function _getUsername() {
      return process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
    }
  }, {
    key: "_createMessage",
    value: function _createMessage(msgType) {
      var msgId = arguments.length <= 1 || arguments[1] === undefined ? (0, _uuidV42["default"])() : arguments[1];

      var message = {
        header: {
          username: this._getUsername(),
          session: "00000000-0000-0000-0000-000000000000",
          msg_type: msgType,
          msg_id: msgId,
          date: new Date(),
          version: "5.0"
        },
        metadata: {},
        parent_header: {},
        content: {}
      };

      return message;
    }
  }]);

  return ZMQKernel;
})(_kernelTransport2["default"]);

exports["default"] = ZMQKernel;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi96bXEta2VybmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2tCQUVlLElBQUk7Ozs7bUJBQ2EsS0FBSzs7c0JBQ3RCLFNBQVM7Ozs7MkJBQ2lDLGFBQWE7O3NCQUVuRCxVQUFVOzs7OytCQUNELG9CQUFvQjs7OztxQkFFNUIsU0FBUzs7SUFlUixTQUFTO1lBQVQsU0FBUzs7QUFZakIsV0FaUSxTQUFTLENBYTFCLFVBQXNCLEVBQ3RCLE9BQXFCLEVBQ3JCLE9BQWUsRUFDZixTQUFvQixFQUNwQjs7OzBCQWpCaUIsU0FBUzs7QUFrQjFCLCtCQWxCaUIsU0FBUyw2Q0FrQnBCLFVBQVUsRUFBRSxPQUFPLEVBQUU7U0FqQjdCLGtCQUFrQixHQUFXLEVBQUU7QUFrQjdCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFN0IsaUNBQVcsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FDbEMsVUFBQyxJQUFpQyxFQUFLO1VBQXBDLE1BQU0sR0FBUixJQUFpQyxDQUEvQixNQUFNO1VBQUUsY0FBYyxHQUF4QixJQUFpQyxDQUF2QixjQUFjO1VBQUUsS0FBSyxHQUEvQixJQUFpQyxDQUFQLEtBQUs7O0FBQzlCLFlBQUssVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUN6QixZQUFLLGNBQWMsR0FBRyxjQUFjLENBQUM7QUFDckMsWUFBSyxhQUFhLEdBQUcsS0FBSyxDQUFDOztBQUUzQixZQUFLLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVqQyxZQUFLLE9BQU8sQ0FBQyxZQUFNO0FBQ2pCLGNBQUssbUJBQW1CLEVBQUUsQ0FBQzs7QUFFM0IsWUFBSSxTQUFTLEVBQUUsU0FBUyxPQUFNLENBQUM7T0FDaEMsQ0FBQyxDQUFDO0tBQ0osQ0FDRixDQUFDO0dBQ0g7O2VBcENrQixTQUFTOztXQXNDckIsaUJBQUMsSUFBZSxFQUFFO0FBQ3ZC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QUNqQixlQUFPLEVBQUUsRUFBRTtPQUNaLENBQUM7O0FBRUYsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztTQXJaa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiL3Jvb3QvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3ptcS1rZXJuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBNZXNzYWdlLCBTb2NrZXQgfSBmcm9tIFwiam1wXCI7XG5pbXBvcnQgdjQgZnJvbSBcInV1aWQvdjRcIjtcbmltcG9ydCB7IGxhdW5jaFNwZWMsIGxhdW5jaFNwZWNGcm9tQ29ubmVjdGlvbkluZm8gfSBmcm9tIFwic3Bhd250ZXJhY3RcIjtcblxuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCBLZXJuZWxUcmFuc3BvcnQgZnJvbSBcIi4va2VybmVsLXRyYW5zcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBSZXN1bHRzQ2FsbGJhY2sgfSBmcm9tIFwiLi9rZXJuZWwtdHJhbnNwb3J0XCI7XG5pbXBvcnQgeyBsb2cgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgdHlwZSBDb25uZWN0aW9uID0ge1xuICBjb250cm9sX3BvcnQ6IG51bWJlcixcbiAgaGJfcG9ydDogbnVtYmVyLFxuICBpb3B1Yl9wb3J0OiBudW1iZXIsXG4gIGlwOiBzdHJpbmcsXG4gIGtleTogc3RyaW5nLFxuICBzaGVsbF9wb3J0OiBudW1iZXIsXG4gIHNpZ25hdHVyZV9zY2hlbWU6IHN0cmluZyxcbiAgc3RkaW5fcG9ydDogbnVtYmVyLFxuICB0cmFuc3BvcnQ6IHN0cmluZyxcbiAgdmVyc2lvbjogbnVtYmVyXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBaTVFLZXJuZWwgZXh0ZW5kcyBLZXJuZWxUcmFuc3BvcnQge1xuICBleGVjdXRpb25DYWxsYmFja3M6IE9iamVjdCA9IHt9O1xuICBjb25uZWN0aW9uOiBDb25uZWN0aW9uO1xuICBjb25uZWN0aW9uRmlsZTogc3RyaW5nO1xuICBrZXJuZWxQcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcbiAgb3B0aW9uczogT2JqZWN0O1xuXG4gIHNoZWxsU29ja2V0OiBTb2NrZXQ7XG4gIGNvbnRyb2xTb2NrZXQ6IFNvY2tldDtcbiAgc3RkaW5Tb2NrZXQ6IFNvY2tldDtcbiAgaW9Tb2NrZXQ6IFNvY2tldDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXJuZWxTcGVjOiBLZXJuZWxzcGVjLFxuICAgIGdyYW1tYXI6IGF0b20kR3JhbW1hcixcbiAgICBvcHRpb25zOiBPYmplY3QsXG4gICAgb25TdGFydGVkOiA/RnVuY3Rpb25cbiAgKSB7XG4gICAgc3VwZXIoa2VybmVsU3BlYywgZ3JhbW1hcik7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIGxhdW5jaFNwZWMoa2VybmVsU3BlYywgb3B0aW9ucykudGhlbihcbiAgICAgICh7IGNvbmZpZywgY29ubmVjdGlvbkZpbGUsIHNwYXduIH0pID0+IHtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gY29uZmlnO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25GaWxlID0gY29ubmVjdGlvbkZpbGU7XG4gICAgICAgIHRoaXMua2VybmVsUHJvY2VzcyA9IHNwYXduO1xuXG4gICAgICAgIHRoaXMubW9uaXRvck5vdGlmaWNhdGlvbnMoc3Bhd24pO1xuXG4gICAgICAgIHRoaXMuY29ubmVjdCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZXhlY3V0ZVN0YXJ0dXBDb2RlKCk7XG5cbiAgICAgICAgICBpZiAob25TdGFydGVkKSBvblN0YXJ0ZWQodGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBjb25uZWN0KGRvbmU6ID9GdW5jdGlvbikge1xuICAgIGNvbnN0IHNjaGVtZSA9IHRoaXMuY29ubmVjdGlvbi5zaWduYXR1cmVfc2NoZW1lLnNsaWNlKFwiaG1hYy1cIi5sZW5ndGgpO1xuICAgIGNvbnN0IHsga2V5IH0gPSB0aGlzLmNvbm5lY3Rpb247XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0ID0gbmV3IFNvY2tldChcImRlYWxlclwiLCBzY2hlbWUsIGtleSk7XG4gICAgdGhpcy5jb250cm9sU29ja2V0ID0gbmV3IFNvY2tldChcImRlYWxlclwiLCBzY2hlbWUsIGtleSk7XG4gICAgdGhpcy5zdGRpblNvY2tldCA9IG5ldyBTb2NrZXQoXCJkZWFsZXJcIiwgc2NoZW1lLCBrZXkpO1xuICAgIHRoaXMuaW9Tb2NrZXQgPSBuZXcgU29ja2V0KFwic3ViXCIsIHNjaGVtZSwga2V5KTtcblxuICAgIGNvbnN0IGlkID0gdjQoKTtcbiAgICB0aGlzLnNoZWxsU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLmNvbnRyb2xTb2NrZXQuaWRlbnRpdHkgPSBgY29udHJvbCR7aWR9YDtcbiAgICB0aGlzLnN0ZGluU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLmlvU29ja2V0LmlkZW50aXR5ID0gYHN1YiR7aWR9YDtcblxuICAgIGNvbnN0IGFkZHJlc3MgPSBgJHt0aGlzLmNvbm5lY3Rpb24udHJhbnNwb3J0fTovLyR7dGhpcy5jb25uZWN0aW9uLmlwfTpgO1xuICAgIHRoaXMuc2hlbGxTb2NrZXQuY29ubmVjdChhZGRyZXNzICsgdGhpcy5jb25uZWN0aW9uLnNoZWxsX3BvcnQpO1xuICAgIHRoaXMuY29udHJvbFNvY2tldC5jb25uZWN0KGFkZHJlc3MgKyB0aGlzLmNvbm5lY3Rpb24uY29udHJvbF9wb3J0KTtcbiAgICB0aGlzLmlvU29ja2V0LmNvbm5lY3QoYWRkcmVzcyArIHRoaXMuY29ubmVjdGlvbi5pb3B1Yl9wb3J0KTtcbiAgICB0aGlzLmlvU29ja2V0LnN1YnNjcmliZShcIlwiKTtcbiAgICB0aGlzLnN0ZGluU29ja2V0LmNvbm5lY3QoYWRkcmVzcyArIHRoaXMuY29ubmVjdGlvbi5zdGRpbl9wb3J0KTtcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQub24oXCJtZXNzYWdlXCIsIHRoaXMub25TaGVsbE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5pb1NvY2tldC5vbihcIm1lc3NhZ2VcIiwgdGhpcy5vbklPTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnN0ZGluU29ja2V0Lm9uKFwibWVzc2FnZVwiLCB0aGlzLm9uU3RkaW5NZXNzYWdlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5tb25pdG9yKGRvbmUpO1xuICB9XG5cbiAgbW9uaXRvck5vdGlmaWNhdGlvbnMoY2hpbGRQcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQub24oXCJkYXRhXCIsIChkYXRhOiBzdHJpbmcgfCBCdWZmZXIpID0+IHtcbiAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoXCJIeWRyb2dlbi5rZXJuZWxOb3RpZmljYXRpb25zXCIpKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKHRoaXMua2VybmVsU3BlYy5kaXNwbGF5X25hbWUsIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YSxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZyhcIlpNUUtlcm5lbDogc3Rkb3V0OlwiLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oXCJkYXRhXCIsIChkYXRhOiBzdHJpbmcgfCBCdWZmZXIpID0+IHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih0aGlzLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLnRvU3RyaW5nKCksXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIG1vbml0b3IoZG9uZTogP0Z1bmN0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBzb2NrZXROYW1lcyA9IFtcInNoZWxsU29ja2V0XCIsIFwiY29udHJvbFNvY2tldFwiLCBcImlvU29ja2V0XCJdO1xuXG4gICAgICBsZXQgd2FpdEdyb3VwID0gc29ja2V0TmFtZXMubGVuZ3RoO1xuXG4gICAgICBjb25zdCBvbkNvbm5lY3QgPSAoeyBzb2NrZXROYW1lLCBzb2NrZXQgfSkgPT4ge1xuICAgICAgICBsb2coXCJaTVFLZXJuZWw6IFwiICsgc29ja2V0TmFtZSArIFwiIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgc29ja2V0LnVubW9uaXRvcigpO1xuXG4gICAgICAgIHdhaXRHcm91cC0tO1xuICAgICAgICBpZiAod2FpdEdyb3VwID09PSAwKSB7XG4gICAgICAgICAgbG9nKFwiWk1RS2VybmVsOiBhbGwgbWFpbiBzb2NrZXRzIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKFwiaWRsZVwiKTtcbiAgICAgICAgICBpZiAoZG9uZSkgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBtb25pdG9yID0gKHNvY2tldE5hbWUsIHNvY2tldCkgPT4ge1xuICAgICAgICBsb2coXCJaTVFLZXJuZWw6IG1vbml0b3IgXCIgKyBzb2NrZXROYW1lKTtcbiAgICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCBvbkNvbm5lY3QuYmluZCh0aGlzLCB7IHNvY2tldE5hbWUsIHNvY2tldCB9KSk7XG4gICAgICAgIHNvY2tldC5tb25pdG9yKCk7XG4gICAgICB9O1xuXG4gICAgICBtb25pdG9yKFwic2hlbGxTb2NrZXRcIiwgdGhpcy5zaGVsbFNvY2tldCk7XG4gICAgICBtb25pdG9yKFwiY29udHJvbFNvY2tldFwiLCB0aGlzLmNvbnRyb2xTb2NrZXQpO1xuICAgICAgbW9uaXRvcihcImlvU29ja2V0XCIsIHRoaXMuaW9Tb2NrZXQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihcIlpNUUtlcm5lbDpcIiwgZXJyKTtcbiAgICB9XG4gIH1cblxuICBpbnRlcnJ1cHQoKSB7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJDYW5ub3QgaW50ZXJydXB0IHRoaXMga2VybmVsXCIsIHtcbiAgICAgICAgZGV0YWlsOiBcIktlcm5lbCBpbnRlcnJ1cHRpb24gaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgaW4gV2luZG93cy5cIlxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZyhcIlpNUUtlcm5lbDogc2VuZGluZyBTSUdJTlRcIik7XG4gICAgICB0aGlzLmtlcm5lbFByb2Nlc3Mua2lsbChcIlNJR0lOVFwiKTtcbiAgICB9XG4gIH1cblxuICBfa2lsbCgpIHtcbiAgICBsb2coXCJaTVFLZXJuZWw6IHNlbmRpbmcgU0lHS0lMTFwiKTtcbiAgICB0aGlzLmtlcm5lbFByb2Nlc3Mua2lsbChcIlNJR0tJTExcIik7XG4gIH1cblxuICBfZXhlY3V0ZVN0YXJ0dXBDb2RlKCkge1xuICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gdGhpcy5rZXJuZWxTcGVjLmRpc3BsYXlfbmFtZTtcbiAgICBsZXQgc3RhcnR1cENvZGUgPSBDb25maWcuZ2V0SnNvbihcInN0YXJ0dXBDb2RlXCIpW2Rpc3BsYXlOYW1lXTtcbiAgICBpZiAoc3RhcnR1cENvZGUpIHtcbiAgICAgIGxvZyhcIktlcm5lbE1hbmFnZXI6IEV4ZWN1dGluZyBzdGFydHVwIGNvZGU6XCIsIHN0YXJ0dXBDb2RlKTtcbiAgICAgIHN0YXJ0dXBDb2RlID0gYCR7c3RhcnR1cENvZGV9IFxcbmA7XG4gICAgICB0aGlzLmV4ZWN1dGUoc3RhcnR1cENvZGUsIChtZXNzYWdlLCBjaGFubmVsKSA9PiB7fSk7XG4gICAgfVxuICB9XG5cbiAgc2h1dGRvd24oKSB7XG4gICAgdGhpcy5fc29ja2V0U2h1dGRvd24oKTtcbiAgfVxuXG4gIHJlc3RhcnQob25SZXN0YXJ0ZWQ6ID9GdW5jdGlvbikge1xuICAgIHRoaXMuX3NvY2tldFJlc3RhcnQob25SZXN0YXJ0ZWQpO1xuICB9XG5cbiAgX3NvY2tldFNodXRkb3duKHJlc3RhcnQ6ID9ib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgc2h1dGRvd25fJHt2NCgpfWA7XG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2UoXCJzaHV0ZG93bl9yZXF1ZXN0XCIsIHJlcXVlc3RJZCk7XG5cbiAgICBtZXNzYWdlLmNvbnRlbnQgPSB7IHJlc3RhcnQgfTtcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICBfc29ja2V0UmVzdGFydChvblJlc3RhcnRlZDogP0Z1bmN0aW9uKSB7XG4gICAgaWYgKHRoaXMuZXhlY3V0aW9uU3RhdGUgPT09IFwicmVzdGFydGluZ1wiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0RXhlY3V0aW9uU3RhdGUoXCJyZXN0YXJ0aW5nXCIpO1xuICAgIHRoaXMuX3NvY2tldFNodXRkb3duKHRydWUpO1xuICAgIHRoaXMuX2tpbGwoKTtcbiAgICBjb25zdCB7IHNwYXduIH0gPSBsYXVuY2hTcGVjRnJvbUNvbm5lY3Rpb25JbmZvKFxuICAgICAgdGhpcy5rZXJuZWxTcGVjLFxuICAgICAgdGhpcy5jb25uZWN0aW9uLFxuICAgICAgdGhpcy5jb25uZWN0aW9uRmlsZSxcbiAgICAgIHRoaXMub3B0aW9uc1xuICAgICk7XG4gICAgdGhpcy5rZXJuZWxQcm9jZXNzID0gc3Bhd247XG4gICAgdGhpcy5tb25pdG9yKCgpID0+IHtcbiAgICAgIGlmIChvblJlc3RhcnRlZCkgb25SZXN0YXJ0ZWQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIG9uUmVzdWx0cyBpcyBhIGNhbGxiYWNrIHRoYXQgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xuICAvLyBhcyByZXN1bHRzIGNvbWUgaW4gZnJvbSB0aGUga2VybmVsXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjaykge1xuICAgIGxvZyhcIlpNUUtlcm5lbC5leGVjdXRlOlwiLCBjb2RlKTtcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgZXhlY3V0ZV8ke3Y0KCl9YDtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKFwiZXhlY3V0ZV9yZXF1ZXN0XCIsIHJlcXVlc3RJZCk7XG5cbiAgICBtZXNzYWdlLmNvbnRlbnQgPSB7XG4gICAgICBjb2RlLFxuICAgICAgc2lsZW50OiBmYWxzZSxcbiAgICAgIHN0b3JlX2hpc3Rvcnk6IHRydWUsXG4gICAgICB1c2VyX2V4cHJlc3Npb25zOiB7fSxcbiAgICAgIGFsbG93X3N0ZGluOiB0cnVlXG4gICAgfTtcblxuICAgIHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2tzW3JlcXVlc3RJZF0gPSBvblJlc3VsdHM7XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0LnNlbmQobmV3IE1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgY29tcGxldGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjaykge1xuICAgIGxvZyhcIlpNUUtlcm5lbC5jb21wbGV0ZTpcIiwgY29kZSk7XG5cbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgY29tcGxldGVfJHt2NCgpfWA7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShcImNvbXBsZXRlX3JlcXVlc3RcIiwgcmVxdWVzdElkKTtcblxuICAgIG1lc3NhZ2UuY29udGVudCA9IHtcbiAgICAgIGNvZGUsXG4gICAgICB0ZXh0OiBjb2RlLFxuICAgICAgbGluZTogY29kZSxcbiAgICAgIGN1cnNvcl9wb3M6IGNvZGUubGVuZ3RoXG4gICAgfTtcblxuICAgIHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2tzW3JlcXVlc3RJZF0gPSBvblJlc3VsdHM7XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0LnNlbmQobmV3IE1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgaW5zcGVjdChjb2RlOiBzdHJpbmcsIGN1cnNvclBvczogbnVtYmVyLCBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFjaykge1xuICAgIGxvZyhcIlpNUUtlcm5lbC5pbnNwZWN0OlwiLCBjb2RlLCBjdXJzb3JQb3MpO1xuXG4gICAgY29uc3QgcmVxdWVzdElkID0gYGluc3BlY3RfJHt2NCgpfWA7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShcImluc3BlY3RfcmVxdWVzdFwiLCByZXF1ZXN0SWQpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0ge1xuICAgICAgY29kZSxcbiAgICAgIGN1cnNvcl9wb3M6IGN1cnNvclBvcyxcbiAgICAgIGRldGFpbF9sZXZlbDogMFxuICAgIH07XG5cbiAgICB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrc1tyZXF1ZXN0SWRdID0gb25SZXN1bHRzO1xuXG4gICAgdGhpcy5zaGVsbFNvY2tldC5zZW5kKG5ldyBNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIGlucHV0UmVwbHkoaW5wdXQ6IHN0cmluZykge1xuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBpbnB1dF9yZXBseV8ke3Y0KCl9YDtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKFwiaW5wdXRfcmVwbHlcIiwgcmVxdWVzdElkKTtcblxuICAgIG1lc3NhZ2UuY29udGVudCA9IHsgdmFsdWU6IGlucHV0IH07XG5cbiAgICB0aGlzLnN0ZGluU29ja2V0LnNlbmQobmV3IE1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgb25TaGVsbE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGxvZyhcInNoZWxsIG1lc3NhZ2U6XCIsIG1lc3NhZ2UpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1ZhbGlkTWVzc2FnZShtZXNzYWdlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbXNnX2lkIH0gPSBtZXNzYWdlLnBhcmVudF9oZWFkZXI7XG4gICAgbGV0IGNhbGxiYWNrO1xuICAgIGlmIChtc2dfaWQpIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5leGVjdXRpb25DYWxsYmFja3NbbXNnX2lkXTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UsIFwic2hlbGxcIik7XG4gICAgfVxuICB9XG5cbiAgb25TdGRpbk1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGxvZyhcInN0ZGluIG1lc3NhZ2U6XCIsIG1lc3NhZ2UpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1ZhbGlkTWVzc2FnZShtZXNzYWdlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlucHV0X3JlcXVlc3QgbWVzc2FnZXMgYXJlIGF0dHJpYnV0YWJsZSB0byBwYXJ0aWN1bGFyIGV4ZWN1dGlvbiByZXF1ZXN0cyxcbiAgICAvLyBhbmQgc2hvdWxkIHBhc3MgdGhyb3VnaCB0aGUgbWlkZGxld2FyZSBzdGFjayB0byBhbGxvdyBwbHVnaW5zIHRvIHNlZSB0aGVtXG4gICAgY29uc3QgeyBtc2dfaWQgfSA9IG1lc3NhZ2UucGFyZW50X2hlYWRlcjtcbiAgICBsZXQgY2FsbGJhY2s7XG4gICAgaWYgKG1zZ19pZCkge1xuICAgICAgY2FsbGJhY2sgPSB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrc1ttc2dfaWRdO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sobWVzc2FnZSwgXCJzdGRpblwiKTtcbiAgICB9XG4gIH1cblxuICBvbklPTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgbG9nKFwiSU8gbWVzc2FnZTpcIiwgbWVzc2FnZSk7XG5cbiAgICBpZiAoIXRoaXMuX2lzVmFsaWRNZXNzYWdlKG1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBtc2dfdHlwZSB9ID0gbWVzc2FnZS5oZWFkZXI7XG5cbiAgICBpZiAobXNnX3R5cGUgPT09IFwic3RhdHVzXCIpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fc3RhdGU7XG4gICAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKHN0YXR1cyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBtc2dfaWQgfSA9IG1lc3NhZ2UucGFyZW50X2hlYWRlcjtcbiAgICBsZXQgY2FsbGJhY2s7XG4gICAgaWYgKG1zZ19pZCkge1xuICAgICAgY2FsbGJhY2sgPSB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrc1ttc2dfaWRdO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sobWVzc2FnZSwgXCJpb3B1YlwiKTtcbiAgICB9XG4gIH1cblxuICBfaXNWYWxpZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBudWxsXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5jb250ZW50KSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgY29udGVudFwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5jb250ZW50LmV4ZWN1dGlvbl9zdGF0ZSA9PT0gXCJzdGFydGluZ1wiKSB7XG4gICAgICAvLyBLZXJuZWxzIHNlbmQgYSBzdGFydGluZyBzdGF0dXMgbWVzc2FnZSB3aXRoIGFuIGVtcHR5IHBhcmVudF9oZWFkZXJcbiAgICAgIGxvZyhcIkRyb3BwZWQgc3RhcnRpbmcgc3RhdHVzIElPIG1lc3NhZ2VcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLnBhcmVudF9oZWFkZXIpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBwYXJlbnRfaGVhZGVyXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5wYXJlbnRfaGVhZGVyLm1zZ19pZCkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXIubXNnX2lkXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5wYXJlbnRfaGVhZGVyLm1zZ190eXBlKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgcGFyZW50X2hlYWRlci5tc2dfdHlwZVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgaGVhZGVyXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5oZWFkZXIubXNnX2lkKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgaGVhZGVyLm1zZ19pZFwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyLm1zZ190eXBlKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgaGVhZGVyLm1zZ190eXBlXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJaTVFLZXJuZWw6IGRlc3Ryb3k6XCIsIHRoaXMpO1xuXG4gICAgdGhpcy5zaHV0ZG93bigpO1xuXG4gICAgdGhpcy5fa2lsbCgpO1xuICAgIGZzLnVubGlua1N5bmModGhpcy5jb25uZWN0aW9uRmlsZSk7XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0LmNsb3NlKCk7XG4gICAgdGhpcy5jb250cm9sU29ja2V0LmNsb3NlKCk7XG4gICAgdGhpcy5pb1NvY2tldC5jbG9zZSgpO1xuICAgIHRoaXMuc3RkaW5Tb2NrZXQuY2xvc2UoKTtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIF9nZXRVc2VybmFtZSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgcHJvY2Vzcy5lbnYuTE9HTkFNRSB8fFxuICAgICAgcHJvY2Vzcy5lbnYuVVNFUiB8fFxuICAgICAgcHJvY2Vzcy5lbnYuTE5BTUUgfHxcbiAgICAgIHByb2Nlc3MuZW52LlVTRVJOQU1FXG4gICAgKTtcbiAgfVxuXG4gIF9jcmVhdGVNZXNzYWdlKG1zZ1R5cGU6IHN0cmluZywgbXNnSWQ6IHN0cmluZyA9IHY0KCkpIHtcbiAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgaGVhZGVyOiB7XG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLl9nZXRVc2VybmFtZSgpLFxuICAgICAgICBzZXNzaW9uOiBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiLFxuICAgICAgICBtc2dfdHlwZTogbXNnVHlwZSxcbiAgICAgICAgbXNnX2lkOiBtc2dJZCxcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgdmVyc2lvbjogXCI1LjBcIlxuICAgICAgfSxcbiAgICAgIG1ldGFkYXRhOiB7fSxcbiAgICAgIHBhcmVudF9oZWFkZXI6IHt9LFxuICAgICAgY29udGVudDoge31cbiAgICB9O1xuXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cbn1cbiJdfQ==