require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');

const mongooseOptions = {
  useNewUrlParser: true,
  reconnectTries: 3, // Retry up to 3 times
  reconnectInterval: 1000, // Reconnect every 1s
  connectTimeoutMS: 100000
};
const app_port = process.env.PORT;
const db_uri = process.env.MONGODB_URI;

const connectDBWithRetry = (retries) => {
  mongoose.connect(db_uri, mongooseOptions).then(()=>{
    console.log('MongoDB is connected!');
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error!! Error: '));
  }).catch(err => {
    console.warn('MongoDB connection unsuccessful, retry after 5 seconds...');
    if (retries > 0) setTimeout(connectDBWithRetry, 5000, retries - 1);
    else console.error('MongoDB connection error!! Error: ', err);
  })
};

const main = () => {
  connectDBWithRetry(1);
  app().listen(app_port, () => {
    console.log(`Visit Manager server up in port ${app_port}!`);
  });
};


process.on('SIGINT', function() {
  process.exit();
});

if (require.main === module) {
  main();
}
