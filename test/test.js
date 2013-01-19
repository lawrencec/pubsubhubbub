var chai = require('chai'),
    fs = require('fs'),
    PubSubHubbub = require('../index.js').PubSubHubbub,
    sinonChai = require('sinon-chai'),
    sinon = require('sinon'),
    unroll = require('unroll');

chai.use(sinonChai);
expect = chai.expect;

var pubsub;


describe('subscribes/unsubscribes', function() {

    beforeEach(function(done) {
        pubsub = new PubSubHubbub({
            callbackServer: 'fakeserver.com',
            callbackPath: '/fakehub',
            port: 8084
        });
        sinon.stub(pubsub, 'start', function() {
        });
        pubsub.start();
        done();
    });

    afterEach(function(done) {
        pubsub.stop(done);
    });

    unroll('#mode to feed and calls callback correctly when error is #error and statusCode is #statusCode',
        function(doneCallback, testArgs) {
            var testTopic = 'topic',
                testHub = 'hub',
                client;

            client = {
                successCallback: function(err, subscription) {
                    expect(arguments.length).to.equal(2);
                    expect(err).to.not.exist;
                    expect(subscription).to.equal(testTopic);
                    doneCallback();
                },
                errorCallback: function(err, subscription) {
                    var errorVal = (err); //? err.toString() : err;
                    expect(arguments.length).to.equal(1);
                    expect(errorVal).to.equal(testArgs['error']);
                    expect(typeof err).to.equal(typeof testArgs['error']);
                    expect(subscription).to.be.undefined;
                    doneCallback();
                }
            };

            // stub out setSubscription as we don't want to actually call the hub
            sinon.stub(pubsub, 'setSubscription', function(mode, topic, hub, callback) {
                var error = testArgs['error'];
                pubsub.pubsubResponse(
                    topic,
                    callback,
                    error,
                    (testArgs['statusCode']) ? { statusCode: testArgs['statusCode'] } : {}
                );
            });

            var pubsubAction = testArgs['mode'],
                callBackName = ((testArgs['error'] != null) ? 'errorCallback' : 'successCallback');
            pubsub[pubsubAction](testTopic, testHub, client[callBackName]);
        },
        [
            ['mode' , 'error' , 'statusCode'],
            ['subscribe' , null, 200],
            ['subscribe' , 'Error: Invalid response status 422' , 422],
            ['subscribe' , 'Error: Network timeout' , 422],
            ['unsubscribe' , null, 200],
            ['unsubscribe' , 'Error: Invalid response status 422' , 422],
            ['unsubscribe' , 'Error: Network timeout' , 422]
        ]
    );
})

describe('events', function() {
    var notificationXML = fs.readFileSync('./test/fixtures/notification.xml', 'utf-8'),
        notificationDoubleXML = fs.readFileSync('./test/fixtures/notification-double.xml', 'utf-8');

    beforeEach(function(done) {
        pubsub = new PubSubHubbub({
            callbackServer: 'fakeserver.com',
            callbackPath: '/fakehub',
            port: 8084
        });
        sinon.stub(pubsub, 'start', function() {});
        pubsub.start();
        done();
    });

    afterEach(function(done) {
        pubsub.stop(done);
    });

    it('publishes feed event with headers', function() {
        var spy = sinon.spy();

        pubsub.on('feed', spy);
        pubsub.parseXMLFeed(
            notificationXML,
            {
                'content-type' : 'application/atom+xml; charset=UTF-8'
            }
        );
        expect(spy.callCount).to.be.equal(1);
        var spyCall = spy.getCall(0);
        expect(spyCall.args[0].feed).to.exist;
        expect(spyCall.args[0].headers).to.exist;
        expect(spyCall.args[0].headers['content-type']).to.equal('application/atom+xml; charset=UTF-8');
    })
});