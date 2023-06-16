import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes.js'


const app = express();

app.use(cors(
  {origin: ['http://127.0.0.1:8091', '*'],
        methods: ["POST", "GET", "PUT", "DELETE"],
        credentials: true}
));
app.use(cookieParser());
app.use(express.json());
app.use(routes)

const port = process.env.PORT;
app.listen(port, () => {
  console.log('Server is running on ' + port);
});
