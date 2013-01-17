/*
 * This example shows how to subscribe to superfeedr providing
 * you have an account and provide the correct details (using HTTP Basic).
 * If you have to use HTTP Basic, make sure you use https.
 * Example usage:
 * node examples/example.js --callbackServer http://yourserver.com --callbackPort 8084 --topic http://push-pub.appspot.com/feed --hub http://pubsubhubbub.appspot.com/ --auth.username foo --auth.password ba
 */
var nconf = require('nconf'),
    PubSubHubbub = require("../index").PubSubHubbub;

nconf.argv();

var callbackServer = nconf.get('callbackServer'),
    callbackPort = nconf.get('callbackPort'),
    topicFeed = nconf.get('topic'),
    aHub = nconf.get('hub'),
    config;

config = {
    callbackServer: callbackServer, //change this to where you are running this
    callbackPath: '/hub',
    port: callbackPort
}

if (nconf.get('auth')) {
    config.headers = { // provide headers if required
        "Authorization" : "Basic " +
        new Buffer(
            nconf.get('auth').username  + ":" + nconf.get('auth').password
        ).toString("base64")
//        "Accept": 'application/json' //
    }
}
var pubsub = new PubSubHubbub(config);

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
    console.log('Date : ', feed.getDate());
    console.log('Title : ', feed.getTitle());
    console.log('Description : ', feed.getDescription());
    console.log('Encoding : ', feed.getEncoding());
    console.log('Hub : ', feed.getHub());
    console.log('Image : ', feed.getImage());
    console.log('Permalink : ', feed.getPermalink());
    console.log('Num of items : ', feed.getItemQuantity());
    var items = feed.getItems();
    items.forEach(function(item, index, arr) {
        console.log('Item ' + index);
            ['Title',
            'Description',
            'Authors',
            'Categories',
            'Comments',
            'Contents',
            'Date',
            'Permalink',
            'UpdateDate'
            ].forEach(function(field) {
                console.log(' - ' +  field + ' : ', item['get'+field]());
            });
    });
    pubsub.unsubscribe(feed.getPermalink(), feed.getHub(), console.log.bind(console, "Unsubscribed "+feed.getPermalink()+" from "+feed.getHub()));
});

pubsub.on("listen", function(){
    var topic = topicFeed,
        hub = aHub;

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