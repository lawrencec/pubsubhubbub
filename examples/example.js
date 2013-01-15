/*
 * This example shows how to subscribe to superfeedr providing
 * you have an account and provide the correct details (using HTTP Basic).
 * If you have to use HTTP Basic, make sure you use https.
 */


var PubSubHubbub = require("../index").PubSubHubbub;

var pubsub = new PubSubHubbub({
    callbackServer: "http://myserver.com", //change this to where you are running this
    callbackPath: '/hub',
    port: 8084
//    headers: { // provide headers if required
//        "Authorization" : "Basic " +
//            new Buffer(
//                'username' + ":" + 'password'
//            ).toString("base64"),
//        "Accept": 'application/json' //
//    }

});

pubsub.on("subscribe", function(data){
    console.log("subscribe: ")
    console.log(data);
});

pubsub.on("unsubscribe", function(data){
    console.log("Unsubscribe");
    console.log(data);
});

pubsub.on("error", function(error){
    console.log("Error");
    console.log(error);
});

pubsub.on("feed", function(feed){
    console.log(feed);
    pubsub.unsubscribe(feed.getPermalink(), feed.getHub(), console.log.bind(console, "Unsubscribed "+feed.getPermalink()+" from "+feed.getHub()));
});

pubsub.on("listen", function(){
    var topic = "http://testetstetss.blogspot.com/feeds/posts/default",
        hub = "http://pubsubhubbub.appspot.com/";

    console.log('Listening to hub: ' + hub);

    pubsub.subscribe(topic, hub, function(err, subscription){
        if(err){
            console.log("Subscribing failed");
            console.log(err);
            return;
        }
        if(subscription == topic){
            console.log("Subscribed "+topic+" to "+hub);
        }else{
            console.log("Invalid response");
            return;
        }
    });
});
pubsub.start();

process.on('SIGINT', function () {
    console.log("Closing");
    pubsub.stop();
});