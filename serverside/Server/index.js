
// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const https = require('https');

// TLS/SSL Certificates
const privateKey = fs.readFileSync('/etc/letsencrypt/live/uqpool.xyz/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/uqpool.xyz/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/uqpool.xyz/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const httpsPort = 7777;

// define express
const app = express();
// Enhance API security
app.use(helmet());
// convert incoming request body to json
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan('combined'));

// Start the HTTPS servers
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(httpsPort, () => {
		console.log('HTTPS Server running on port ' + httpsPort);
});


// end point requires
const user = require('./user');
const navigation = require('./navigation');
const book = require('./book');
const rate = require('./rate');
const reward = require('./reward');

// available users being connected
var connected = {};
// Chat rooms for accepted pools 
var pools = {};

/* Request section:
These should reflect the state machine's side effects for
login/registration
booking
navigation
scheduling
rating/review
rewards
*/

// Registration section
app.post('/login', async(req, res) => {
    user.login(req.body, function (payload) {
        res.send(payload);
    });
});

app.put('/user', async(req, res) => {
    user.update(req.body, function (payload) {
        res.send(payload);
    });
});

app.delete('/user', async(req, res) => {
    user.remove(req.body.user, function (payload) {
        res.send(payload);
    });
});

app.post('/user', async(req, res) => {
    user.create(req.body, function (payload) {
	res.send(payload);
    });
});

app.get('/users', async(req, res) => {
    user.users(req.body, function (payload) {
        res.send(payload);
    });
});

// History section
app.get('/history', async(req, res) => {
    user.history(req.body.user, function (payload) {
        res.send(payload);
    });
});

// Review section 
app.post('/rate', async(req, res) => {
    rate.create(req.body, function (payload) {
        res.send(payload);
    });
});

app.delete('/rate', async(req, res) => {
    rate.remove(req.body, function (payload) {
        res.send(payload);
    });
});

/*const server = app.listen(port, (err) => {
  if (err) {
      return console.log('Error: ', err);
  }
  console.log(`server is listening on ${port}`);
})*/

// webhook section
const io = require('socket.io')(httpsServer);

/* Webhook section
These are a reflection of the user/location/booking/review methods but for 
webhooks requiring persistent connections
*/

io.on('connection', async (socket) => {
    console.log('a user connected');

    // User section
    // Broadcasting user has logged in or out
    // New user location to be added to the table

    // user x logging in
    // Add to either activeDriver | activeRider 
    // broadcast to all sockets in connected with locaiton
    socket.on('login', (body) => {
        connected[body.user] = socket;
        socket.broadcast.emit('login', body);
    });

    // user x logging out
    // Get rid of user in either activeDriver | activeRider
    // delete socket connection in connected
    socket.on('logout', (body) => {
        if (body.user in connected) {
            delete connected[body.user];
            socket.broadcast.emit('logout', body);
        }
    });

    // Navigation and location management
    // user x has refreshed their location
    // broadcast new location to all sockets in connected
    socket.on('location', (body) => {
        socket.broadcast.emit('location', body);
    });

    // Booking section

    // User a requests to user b    
    // socket searches for user b in connected sockets and sends request
    socket.on('request', (body, result) => {

        if (body.driver in connected) {
            book.requestPickup(body, function (payload) {
                result.send(payload);
            });
            connected[body.driver].emit('request', body.driver);
        }

    });

    // user a cancels the request to user b
    // search for user b socket in connected and send cancel message
    socket.on('cancel', (body, request) => {
        if (body.driver in connected) {
            book.cancelPickup(body, function (payload) {
                result.send(payload);
            });
            connected[body.driver].emit('cancel', {message: "Cancelled ride."});
        }
    });

    // user b accepts request
    // add a route if it doesn't exist
    // Then decrease capacity
    socket.on('accept', (body, request) => {
        if (body.passenger in connected) {
            drivers = book.acceptPickup(body, function (payload) {
                    result.send(payload);
            });
            connected[body.passenger].emit('accept', drivers)
        }
    });

    // user b rejects and sends message to user 
    // search for user a socket and send rejection notice
    socket.on('reject', (body) => {
        if (body.passenger in connected) {
            connected[body.passenger].emit('reject', {message: "Ride rejected."});
        }
    });
    
});
