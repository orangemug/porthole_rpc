(function() {
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Porthole.RPC = (function() {
    var uniqName;
    uniqName = function() {
      return "_portholeRPC" + Math.floor(Math.random() * 1000001);
    };
    function RPC(url, opts) {
      var bind, fun, iframe, localFuns, remoteFuns, validRPCFun, _i, _len, _ref;
      localFuns = opts.local;
      remoteFuns = opts.remote;
      iframe = opts.iframe;
      bind = (_ref = opts.bind) != null ? _ref : window;
      this.wp = new Porthole.WindowProxy(url, iframe);
      validRPCFun = function(fun) {
        var rpc, _i, _len;
        for (_i = 0, _len = localFuns.length; _i < _len; _i++) {
          rpc = localFuns[_i];
          if (fun === rpc) {
            return true;
          }
        }
        return false;
      };
      this.rpc = {};
      for (_i = 0, _len = remoteFuns.length; _i < _len; _i++) {
        fun = remoteFuns[_i];
        this.rpc[fun] = __bind(function() {
          var args, f, uid;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          uid = uniqName();
          localFuns.push(uid);
          f = args[args.length - 1];
          bind[uid] = function(type, ret) {
            var idx, lf, _len2;
            if (type === "exec") {
              f(ret);
            }
            for (idx = 0, _len2 = localFuns.length; idx < _len2; idx++) {
              lf = localFuns[idx];
              if (lf === uid) {
                localFuns.splice(idx, 1);
              }
            }
            return bind[uid] = null;
          };
          return this.wp.postMessage({
            "func": fun,
            "args": args,
            "callback": uid
          });
        }, this);
      }
      this.wp.addEventListener(__bind(function(e) {
        var args, callback, callback_type, ret;
        if (!validRPCFun(e.data.func)) {
          return;
        }
        fun = bind[e.data.func];
        args = e.data.args;
        callback = e.data.callback;
        if ((args != null) && fun.length === args.length - 1) {
          args.splice(args.length - 1);
        }
        ret = fun.apply(null, args);
        callback_type = callback != null ? 'exec' : 'delete';
        return this.wp.postMessage({
          "func": callback,
          "args": [callback_type, ret]
        });
      }, this));
    }
    return RPC;
  })();
}).call(this);
