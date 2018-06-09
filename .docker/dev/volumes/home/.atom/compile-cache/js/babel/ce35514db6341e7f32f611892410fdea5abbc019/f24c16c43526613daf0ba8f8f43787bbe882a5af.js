Object.defineProperty(exports, "__esModule", {
  value: true
});

var Config = {
  getJson: function getJson(key) {
    var _default = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var value = atom.config.get("Hydrogen." + key);
    if (!value || typeof value !== "string") return _default;
    try {
      return JSON.parse(value);
    } catch (error) {
      var message = "Your Hydrogen config is broken: " + key;
      atom.notifications.addError(message, { detail: error });
    }
    return _default;
  },

  schema: {
    kernelspec: {},
    autocomplete: {
      title: "Enable Autocomplete",
      includeTitle: false,
      description: "If enabled, use autocomplete options provided by the current kernel.",
      type: "boolean",
      "default": true
    },
    autoScroll: {
      title: "Enable Autoscroll",
      includeTitle: false,
      description: "If enabled, Hydrogen will automatically scroll to the bottom of the result view.",
      type: "boolean",
      "default": true
    },
    outputAreaFontSize: {
      title: "Output area fontsize",
      includeTitle: false,
      description: "Change the fontsize of the Output area.",
      type: "integer",
      minimum: 0,
      "default": 0
    },
    debug: {
      title: "Enable Debug Messages",
      includeTitle: false,
      description: "If enabled, log debug messages onto the dev console.",
      type: "boolean",
      "default": false
    },
    startDir: {
      title: "Directory to start kernel in",
      includeTitle: false,
      description: "Restart the kernel for changes to take effect.",
      type: "string",
      "enum": [{
        value: "firstProjectDir",
        description: "The first started project's directory (default)"
      }, {
        value: "projectDirOfFile",
        description: "The project directory relative to the file"
      }, {
        value: "dirOfFile",
        description: "Current directory of the file"
      }],
      "default": "firstProjectDir"
    },
    kernelNotifications: {
      title: "Enable Kernel Notifications",
      includeTitle: false,
      description: "Notify if kernels writes to stdout. By default, kernel notifications are only displayed in the developer console.",
      type: "boolean",
      "default": false
    },
    gateways: {
      title: "Kernel Gateways",
      includeTitle: false,
      description: 'Hydrogen can connect to remote notebook servers and kernel gateways. Each gateway needs at minimum a name and a value for options.baseUrl. The options are passed directly to the `jupyter-js-services` npm package, which includes documentation for additional fields. Example value: ``` [{ "name": "Remote notebook", "options": { "baseUrl": "http://mysite.com:8888" } }] ```',
      type: "string",
      "default": "[]"
    },
    languageMappings: {
      title: "Language Mappings",
      includeTitle: false,
      description: 'Custom Atom grammars and some kernels use non-standard language names. That leaves Hydrogen unable to figure out what kernel to start for your code. This field should be a valid JSON mapping from a kernel language name to Atom\'s grammar name ``` { "kernel name": "grammar name" } ```. For example ``` { "scala211": "scala", "javascript": "babel es6 javascript", "python": "magicpython" } ```.',
      type: "string",
      "default": "{}"
    },
    startupCode: {
      title: "Startup Code",
      includeTitle: false,
      description: 'This code will be executed on kernel startup. Format: `{"kernel": "your code \\nmore code"}`. Example: `{"Python 2": "%matplotlib inline"}`',
      type: "string",
      "default": "{}"
    },
    outputAreaDock: {
      title: "Leave output dock open",
      description: "Do not close dock when switching to an editor without a running kernel",
      type: "boolean",
      "default": false
    },
    outputAreaDefault: {
      title: "View output in the dock by default",
      description: "If enabled, output will be displayed in the dock by default rather than inline",
      type: "boolean",
      "default": false
    },
    statusBarDisable: {
      title: "Disable the Hydrogen status bar",
      type: "boolean",
      "default": false
    },
    globalMode: {
      title: "If enabled, all files of the same grammar will share a single global kernel (requires atom restart)",
      type: "boolean",
      "default": false
    }
  }
};

exports["default"] = Config;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yb290Ly5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLElBQU0sTUFBTSxHQUFHO0FBQ2IsU0FBTyxFQUFBLGlCQUFDLEdBQVcsRUFBeUI7UUFBdkIsUUFBZ0IseURBQUcsRUFBRTs7QUFDeEMsUUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWEsR0FBRyxDQUFHLENBQUM7QUFDakQsUUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsT0FBTyxRQUFRLENBQUM7QUFDekQsUUFBSTtBQUNGLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMxQixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsVUFBTSxPQUFPLHdDQUFzQyxHQUFHLEFBQUUsQ0FBQztBQUN6RCxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN6RDtBQUNELFdBQU8sUUFBUSxDQUFDO0dBQ2pCOztBQUVELFFBQU0sRUFBRTtBQUNOLGNBQVUsRUFBRSxFQUFFO0FBQ2QsZ0JBQVksRUFBRTtBQUNaLFdBQUssRUFBRSxxQkFBcUI7QUFDNUIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQ1Qsc0VBQXNFO0FBQ3hFLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsY0FBVSxFQUFFO0FBQ1YsV0FBSyxFQUFFLG1CQUFtQjtBQUMxQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFDVCxrRkFBa0Y7QUFDcEYsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxzQkFBa0IsRUFBRTtBQUNsQixXQUFLLEVBQUUsc0JBQXNCO0FBQzdCLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUFFLHlDQUF5QztBQUN0RCxVQUFJLEVBQUUsU0FBUztBQUNmLGFBQU8sRUFBRSxDQUFDO0FBQ1YsaUJBQVMsQ0FBQztLQUNYO0FBQ0QsU0FBSyxFQUFFO0FBQ0wsV0FBSyxFQUFFLHVCQUF1QjtBQUM5QixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFBRSxzREFBc0Q7QUFDbkUsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxZQUFRLEVBQUU7QUFDUixXQUFLLEVBQUUsOEJBQThCO0FBQ3JDLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUFFLGdEQUFnRDtBQUM3RCxVQUFJLEVBQUUsUUFBUTtBQUNkLGNBQU0sQ0FDSjtBQUNFLGFBQUssRUFBRSxpQkFBaUI7QUFDeEIsbUJBQVcsRUFBRSxpREFBaUQ7T0FDL0QsRUFDRDtBQUNFLGFBQUssRUFBRSxrQkFBa0I7QUFDekIsbUJBQVcsRUFBRSw0Q0FBNEM7T0FDMUQsRUFDRDtBQUNFLGFBQUssRUFBRSxXQUFXO0FBQ2xCLG1CQUFXLEVBQUUsK0JBQStCO09BQzdDLENBQ0Y7QUFDRCxpQkFBUyxpQkFBaUI7S0FDM0I7QUFDRCx1QkFBbUIsRUFBRTtBQUNuQixXQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUNULG1IQUFtSDtBQUNySCxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELFlBQVEsRUFBRTtBQUNSLFdBQUssRUFBRSxpQkFBaUI7QUFDeEIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQ1QscVhBQXFYO0FBQ3ZYLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsSUFBSTtLQUNkO0FBQ0Qsb0JBQWdCLEVBQUU7QUFDaEIsV0FBSyxFQUFFLG1CQUFtQjtBQUMxQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFDVCwyWUFBMlk7QUFDN1ksVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxlQUFXLEVBQUU7QUFDWCxXQUFLLEVBQUUsY0FBYztBQUNyQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFDVCw2SUFBNkk7QUFDL0ksVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxrQkFBYyxFQUFFO0FBQ2QsV0FBSyxFQUFFLHdCQUF3QjtBQUMvQixpQkFBVyxFQUNULHdFQUF3RTtBQUMxRSxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELHFCQUFpQixFQUFFO0FBQ2pCLFdBQUssRUFBRSxvQ0FBb0M7QUFDM0MsaUJBQVcsRUFDVCxnRkFBZ0Y7QUFDbEYsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxvQkFBZ0IsRUFBRTtBQUNoQixXQUFLLEVBQUUsaUNBQWlDO0FBQ3hDLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsY0FBVSxFQUFFO0FBQ1YsV0FBSyxFQUNILHFHQUFxRztBQUN2RyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtHQUNGO0NBQ0YsQ0FBQzs7cUJBRWEsTUFBTSIsImZpbGUiOiIvcm9vdC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuY29uc3QgQ29uZmlnID0ge1xuICBnZXRKc29uKGtleTogc3RyaW5nLCBfZGVmYXVsdDogT2JqZWN0ID0ge30pIHtcbiAgICBjb25zdCB2YWx1ZSA9IGF0b20uY29uZmlnLmdldChgSHlkcm9nZW4uJHtrZXl9YCk7XG4gICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHJldHVybiBfZGVmYXVsdDtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYFlvdXIgSHlkcm9nZW4gY29uZmlnIGlzIGJyb2tlbjogJHtrZXl9YDtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7IGRldGFpbDogZXJyb3IgfSk7XG4gICAgfVxuICAgIHJldHVybiBfZGVmYXVsdDtcbiAgfSxcblxuICBzY2hlbWE6IHtcbiAgICBrZXJuZWxzcGVjOiB7fSxcbiAgICBhdXRvY29tcGxldGU6IHtcbiAgICAgIHRpdGxlOiBcIkVuYWJsZSBBdXRvY29tcGxldGVcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJJZiBlbmFibGVkLCB1c2UgYXV0b2NvbXBsZXRlIG9wdGlvbnMgcHJvdmlkZWQgYnkgdGhlIGN1cnJlbnQga2VybmVsLlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBhdXRvU2Nyb2xsOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgQXV0b3Njcm9sbFwiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIEh5ZHJvZ2VuIHdpbGwgYXV0b21hdGljYWxseSBzY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgcmVzdWx0IHZpZXcuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIG91dHB1dEFyZWFGb250U2l6ZToge1xuICAgICAgdGl0bGU6IFwiT3V0cHV0IGFyZWEgZm9udHNpemVcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogXCJDaGFuZ2UgdGhlIGZvbnRzaXplIG9mIHRoZSBPdXRwdXQgYXJlYS5cIixcbiAgICAgIHR5cGU6IFwiaW50ZWdlclwiLFxuICAgICAgbWluaW11bTogMCxcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB9LFxuICAgIGRlYnVnOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgRGVidWcgTWVzc2FnZXNcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBlbmFibGVkLCBsb2cgZGVidWcgbWVzc2FnZXMgb250byB0aGUgZGV2IGNvbnNvbGUuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBzdGFydERpcjoge1xuICAgICAgdGl0bGU6IFwiRGlyZWN0b3J5IHRvIHN0YXJ0IGtlcm5lbCBpblwiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlJlc3RhcnQgdGhlIGtlcm5lbCBmb3IgY2hhbmdlcyB0byB0YWtlIGVmZmVjdC5cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbnVtOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogXCJmaXJzdFByb2plY3REaXJcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgZmlyc3Qgc3RhcnRlZCBwcm9qZWN0J3MgZGlyZWN0b3J5IChkZWZhdWx0KVwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogXCJwcm9qZWN0RGlyT2ZGaWxlXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIHByb2plY3QgZGlyZWN0b3J5IHJlbGF0aXZlIHRvIHRoZSBmaWxlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHZhbHVlOiBcImRpck9mRmlsZVwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkN1cnJlbnQgZGlyZWN0b3J5IG9mIHRoZSBmaWxlXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIGRlZmF1bHQ6IFwiZmlyc3RQcm9qZWN0RGlyXCJcbiAgICB9LFxuICAgIGtlcm5lbE5vdGlmaWNhdGlvbnM6IHtcbiAgICAgIHRpdGxlOiBcIkVuYWJsZSBLZXJuZWwgTm90aWZpY2F0aW9uc1wiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIk5vdGlmeSBpZiBrZXJuZWxzIHdyaXRlcyB0byBzdGRvdXQuIEJ5IGRlZmF1bHQsIGtlcm5lbCBub3RpZmljYXRpb25zIGFyZSBvbmx5IGRpc3BsYXllZCBpbiB0aGUgZGV2ZWxvcGVyIGNvbnNvbGUuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBnYXRld2F5czoge1xuICAgICAgdGl0bGU6IFwiS2VybmVsIEdhdGV3YXlzXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdIeWRyb2dlbiBjYW4gY29ubmVjdCB0byByZW1vdGUgbm90ZWJvb2sgc2VydmVycyBhbmQga2VybmVsIGdhdGV3YXlzLiBFYWNoIGdhdGV3YXkgbmVlZHMgYXQgbWluaW11bSBhIG5hbWUgYW5kIGEgdmFsdWUgZm9yIG9wdGlvbnMuYmFzZVVybC4gVGhlIG9wdGlvbnMgYXJlIHBhc3NlZCBkaXJlY3RseSB0byB0aGUgYGp1cHl0ZXItanMtc2VydmljZXNgIG5wbSBwYWNrYWdlLCB3aGljaCBpbmNsdWRlcyBkb2N1bWVudGF0aW9uIGZvciBhZGRpdGlvbmFsIGZpZWxkcy4gRXhhbXBsZSB2YWx1ZTogYGBgIFt7IFwibmFtZVwiOiBcIlJlbW90ZSBub3RlYm9va1wiLCBcIm9wdGlvbnNcIjogeyBcImJhc2VVcmxcIjogXCJodHRwOi8vbXlzaXRlLmNvbTo4ODg4XCIgfSB9XSBgYGAnLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlZmF1bHQ6IFwiW11cIlxuICAgIH0sXG4gICAgbGFuZ3VhZ2VNYXBwaW5nczoge1xuICAgICAgdGl0bGU6IFwiTGFuZ3VhZ2UgTWFwcGluZ3NcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ0N1c3RvbSBBdG9tIGdyYW1tYXJzIGFuZCBzb21lIGtlcm5lbHMgdXNlIG5vbi1zdGFuZGFyZCBsYW5ndWFnZSBuYW1lcy4gVGhhdCBsZWF2ZXMgSHlkcm9nZW4gdW5hYmxlIHRvIGZpZ3VyZSBvdXQgd2hhdCBrZXJuZWwgdG8gc3RhcnQgZm9yIHlvdXIgY29kZS4gVGhpcyBmaWVsZCBzaG91bGQgYmUgYSB2YWxpZCBKU09OIG1hcHBpbmcgZnJvbSBhIGtlcm5lbCBsYW5ndWFnZSBuYW1lIHRvIEF0b21cXCdzIGdyYW1tYXIgbmFtZSBgYGAgeyBcImtlcm5lbCBuYW1lXCI6IFwiZ3JhbW1hciBuYW1lXCIgfSBgYGAuIEZvciBleGFtcGxlIGBgYCB7IFwic2NhbGEyMTFcIjogXCJzY2FsYVwiLCBcImphdmFzY3JpcHRcIjogXCJiYWJlbCBlczYgamF2YXNjcmlwdFwiLCBcInB5dGhvblwiOiBcIm1hZ2ljcHl0aG9uXCIgfSBgYGAuJyxcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcInt9XCJcbiAgICB9LFxuICAgIHN0YXJ0dXBDb2RlOiB7XG4gICAgICB0aXRsZTogXCJTdGFydHVwIENvZGVcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1RoaXMgY29kZSB3aWxsIGJlIGV4ZWN1dGVkIG9uIGtlcm5lbCBzdGFydHVwLiBGb3JtYXQ6IGB7XCJrZXJuZWxcIjogXCJ5b3VyIGNvZGUgXFxcXG5tb3JlIGNvZGVcIn1gLiBFeGFtcGxlOiBge1wiUHl0aG9uIDJcIjogXCIlbWF0cGxvdGxpYiBpbmxpbmVcIn1gJyxcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcInt9XCJcbiAgICB9LFxuICAgIG91dHB1dEFyZWFEb2NrOiB7XG4gICAgICB0aXRsZTogXCJMZWF2ZSBvdXRwdXQgZG9jayBvcGVuXCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJEbyBub3QgY2xvc2UgZG9jayB3aGVuIHN3aXRjaGluZyB0byBhbiBlZGl0b3Igd2l0aG91dCBhIHJ1bm5pbmcga2VybmVsXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBvdXRwdXRBcmVhRGVmYXVsdDoge1xuICAgICAgdGl0bGU6IFwiVmlldyBvdXRwdXQgaW4gdGhlIGRvY2sgYnkgZGVmYXVsdFwiLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiSWYgZW5hYmxlZCwgb3V0cHV0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBkb2NrIGJ5IGRlZmF1bHQgcmF0aGVyIHRoYW4gaW5saW5lXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBzdGF0dXNCYXJEaXNhYmxlOiB7XG4gICAgICB0aXRsZTogXCJEaXNhYmxlIHRoZSBIeWRyb2dlbiBzdGF0dXMgYmFyXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBnbG9iYWxNb2RlOiB7XG4gICAgICB0aXRsZTpcbiAgICAgICAgXCJJZiBlbmFibGVkLCBhbGwgZmlsZXMgb2YgdGhlIHNhbWUgZ3JhbW1hciB3aWxsIHNoYXJlIGEgc2luZ2xlIGdsb2JhbCBrZXJuZWwgKHJlcXVpcmVzIGF0b20gcmVzdGFydClcIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZztcbiJdfQ==