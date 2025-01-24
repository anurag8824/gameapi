const express = require('express');
const bodyParser = require('body-parser');
const gameRoutes = require('./routes/gameRoutes');
const cors=require("cors")
const app = express();

// Middleware
app.use(bodyParser.json());

const managcors=["https://benzowin.com","http://localhost:3000","https://bdg-club.com"]

// Enable CORS
app.use(cors({
//   origin: ,
  origin:managcors ,
  methods: ['GET', 'POST'],
  credentials: true
}));


// Disable cache
app.options('*', cors());

// Use the game routes
app.use('/api', gameRoutes);

// Start the server
const PORT = process.env.PORT || 5500;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0); // Exit the process cleanly
  });

  // Force exit if the server doesn't close in time
  setTimeout(() => {
    console.error('Forcefully shutting down...');
    process.exit(1); // Exit with error code
  }, 5000); // 5 seconds timeout
};

// Handle termination signals
process.on('SIGINT', shutdown);  // Handle Ctrl + C
process.on('SIGTERM', shutdown); // Handle termination signals from external systems
