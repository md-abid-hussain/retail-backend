require('dotenv').config();
const express = require('express');
const { logger } = require('./middleware/logEvent');
const errorHandler = require('./middleware/logError');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');

const PORT = process.env.PORT || 3500;
const app = express();

console.log(process.env.NODE_ENV)

app.use(logger);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser())

app.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});
app.use('/auth', require('./routes/authRoute'));
app.use('/users', require('./routes/userRoute'));
app.use('/products', require('./routes/productRoute'));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
