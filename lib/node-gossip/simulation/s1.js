var Gossiper = require('../lib/gossiper').Gossiper;

var seed = new Gossiper(9000, []);
seed.start();
console.log('Seed node started');

var n = 0;
var gs = [];
var start_time = undefined;
var count = 10;
for(var i = 9001; i < 9001+count;i++) {
  var g = gs[i] = new Gossiper(i, ['192.168.86.194:9000']);
  g.start();
  console.log('Node ' + i + ' started');
  g.on('update', function(peer,k,v) {
    if(k == "hi") {
      console.log("hi received by " + this.peer_name + " at " + (new Date().getTime()));
      n++;
      if(n == count) {
        console.log("fully propagated");
        console.log("took " + (new Date().getTime() - start_time));
        process.exit();
      }
    }
  });
}

var g = new Gossiper(9999, ['192.168.86.194:9000']);
g.start();
console.log('Node 9999 started');

setTimeout(function() {
  console.log(seed.allPeers());
  // Set value for 'hi'
  g.setLocalState('hi', 'hello');
  start_time = new Date().getTime();
  console.log('hi sent ' + (new Date().getTime()));
}, 10000);
