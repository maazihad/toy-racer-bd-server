const express = require('express');
const cors = require('cors');
require('dotenv').config();

// =================================================================Create Express 
const app = express();
const port = process.env.PORT || 5555;
// ===============================================================middleware
app.use(cors());
app.use(express.json());

// ===============================================================Starting route
app.get('/', (req, res) => {
   res.send('Toy racer bd is running ................');
});






//================================================================Listen
app.listen(port, () => {
   console.log(`Toy racer bd is running on port : ${port}`);
})

