# README

This is a super small rpc (remote procedure call) library for the [porthole]() library.


## Download

 * [uncompressed]()
 * [minified]()


## Usage

In the host page (the page hosting the iframe), and an iframe and embed the script

    <script src="porthole_rpc.js"></script>
    <iframe name="prpc_iframe" src="http://domain_2.com/index.html"></iframe>

Then initialize the script

    windowProxy = new Porthole.RPC 'http://domain_2.com/index.html',
      'iframe': 'prpc_iframe'
      'local': []
      'remote':[
        'domain2Test'
      ]

    windowProxy.rpc.domain2Test 1, 2, (resp) ->
      alert "RESULT: #{resp}"


Then in the child page do the same, the only difference being you don't specify an iframe.

    class API
      domain1Test:(a,b) ->
        a + b

    api = new API()
    windowProxy = new Porthole.RPC 'http://domain_1.com/index.html',
      'bind': api
      'local': [
        'domain2Test'
      ]
      'remote':[]


## API

Porthole RPC initializes with the following:

    Porthole.RPC <url> <opts>

The `url` is the url to the page to communicate with.

The `opts` are the an object literal of the following:

 * `local` - list of local methods to expose
 * `remote` - list of remote methods to bind to
 * `iframe` - the name of the iframe in the host page
 * `bind` - the object to bind to when calling _local_ methods


