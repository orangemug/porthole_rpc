class Porthole.RPC
  # PRIVATE
  uniqName = ->
    "_portholeRPC"+Math.floor(Math.random()*1000001)

  # PUBLIC
  constructor: (url, opts) ->
    localFuns  = opts.local
    remoteFuns = opts.remote
    iframe     = opts.iframe
    bind       = opts.bind ? window

    @wp = new Porthole.WindowProxy(url, iframe)

    # Check its a valid function
    validRPCFun = (fun) ->
      for rpc in localFuns
        if fun == rpc
          return true
      return false

    # Create the remote functions  
    @rpc = {}
    for fun in remoteFuns
      # Add objects to the rpc object
      @rpc[fun] = (args...) => 
        # Add the uid func to the allowed list
        uid = uniqName()
        localFuns.push uid

        # We just guessing at this point that the last arg is a calback
        # We work it out in the addEventListener function when we know
        # the length of the arguments.
        f = args[args.length-1]
        bind[uid] = (type, ret) ->
          if type == "exec"
            f(ret)

          # Delete old callbacks
          for lf,idx in localFuns
            localFuns.splice(idx, 1) if lf == uid
          bind[uid] = null
          
        # Post the message
        @wp.postMessage {"func": fun, "args": args, "callback": uid}


    # Register an event handler to receive messages;
    @wp.addEventListener (e) =>
      return if !validRPCFun(e.data.func)

      fun      = bind[e.data.func]
      args     = e.data.args
      callback = e.data.callback

      # Remove the callback from the end
      if args? && fun.length == args.length-1
        args.splice args.length-1

      # Exec
      ret = fun(args...)

      # Post the message as 'exec' if callback defined else 'delete'
      callback_type = if callback? then 'exec' else 'delete'
      @wp.postMessage {"func": callback, "args": [callback_type, ret]}


