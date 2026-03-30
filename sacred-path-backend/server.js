const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

sequelize.authenticate()
    .then(() => {
        console.log('DB connected successfully');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Models synced');
    })
    .catch((err) => {
        console.error('DB connection failed:', err);
    });

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})