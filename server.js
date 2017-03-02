// server.js

// BASE SETUP
// =============================================================================

var mongoose = require('mongoose');
mongoose.connect('mongodb://nodeapitestx:t3stdatabas3@ds058369.mlab.com:58369/nodeapitest');

var REST     = require('./app/models/schema');

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

//apicache
var apicache = require('apicache');
var cache = apicache.middleware;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to our Rest api!' });   
});

// more routes for our API will happen here

// on routes that end in /rests
// ----------------------------------------------------
router.route('/rests')

    // create a rest (accessed at POST http://localhost:8080/api/rests)
    .post(function(req, res) {
        
        var rest = new REST();      // create a new instance of the Rest model
        rest.name = req.body.name;  // set the rests name (comes from the request)

        // save the rest and check for errors
        rest.save(function(err) {
            if (err)
                res.send(err);
            
            //clear the cache to refresh and see the changes immediately
            apicache.clear();

            res.json({ message: 'Rest created!' });
        });
        
    })

    // get all the rests (accessed at GET http://localhost:8080/api/rests)
    // cache for 5 minutes
    .get(cache('5 minutes'),function(req, res) {
        REST.find(function(err, rests) {
            if (err)
                res.send(err);

            res.json(rests);
        });
    });

// on routes that end in /rests/:rest_id
// ----------------------------------------------------
router.route('/rests/:rest_id')

    // get the rest with that id (accessed at GET http://localhost:8080/api/rests/:rest_id)
    //can choose to apply cache, did not choose in this case to see CRUD changes immediately
    .get(function(req, res) {
        REST.findById(req.params.rest_id, function(err, rest) {
            if (err)
                res.send(err);
            res.json(rest);
        });
    })

    // update the rest with this id (accessed at PUT http://localhost:8080/api/rests/:rest_id)
    .put(function(req, res) {

        // use our rest model to find the rest we want
        REST.findById(req.params.rest_id, function(err, rest) {

            if (err)
                res.send(err);

            rest.name = req.body.name;  // update the rests info

            // save the rest
            rest.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Rest updated!' });
            });

        });
    })

    // delete the rest with this id (accessed at DELETE http://localhost:8080/api/rests/:rest_id)
    .delete(function(req, res) {
        REST.remove({
            _id: req.params.rest_id
        }, function(err, rest) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Running on port ' + port);