const express = require('express')
const cors = require('cors')
const sequelize = require('./config/database');
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

sequelize.authenticate()
    .then(() => {
        console.log('DB connected successfully');
    })
    .catch((err) => {
        console.error('DB connection failed:', err);
    });

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})