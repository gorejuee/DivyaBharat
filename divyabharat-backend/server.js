const moduleAlias = require('module-alias');
moduleAlias.addAlias('@server', __dirname);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('@server/config/database');
const authRoutes = require('@server/routes/auth');
const placesRoutes = require('./routes/places');
const db = require('@server/db');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/ai', aiRoutes);

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