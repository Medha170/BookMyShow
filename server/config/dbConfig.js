const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)

const connection = mongoose.connection;

connection.once('connected', () => {
    console.log('Connection Sucessful');
})

connection.on('error', () => {
    console.log('Connection failed');
});