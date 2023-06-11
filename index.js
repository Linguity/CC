import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes.js'


const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(routes)

const port = process.env.PORT;
app.listen(port, () => {
  console.log('Server is running on ' + port);
});
