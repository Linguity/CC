# Linguity App - Cloud Computing

##  Bangkit Capstone Project 2023 
Bangkit Capstone Team ID : C23-PS299

Here is our repository for Bangkit 2023 Capstone project - Cloud Computing

## API description
This is source code API of the Linguity team to make the CRUD (Create, Read, Update and Delete) method that is used by our Linguity Application. This API is built using  MySql, Express.js, React.js, Vite.js and Node.js. We deploy this API in Cloud RUN, use storage with Cloud Storage and use Cloud SQL as a database.

# API documentation Endpoint
## API link to endpoint
https://linguityapi-djq5jpbe4a-et.a.run.app Backend API

https://linguitymlspellapi-djq5jpbe4a-et.a.run.app/spelling Spelling Prediction API

https://linguitymlappi-djq5jpbe4a-et.a.run.app/predict Pronunciation Prediction API

## Postmant Documentation API

https://linguityapi-djq5jpbe4a-et.a.run.app/register Register User

https://linguityapi-djq5jpbe4a-et.a.run.app/login Login User

https://linguityapi-djq5jpbe4a-et.a.run.app/uploadImage/:id Upload Image

https://linguityapi-djq5jpbe4a-et.a.run.app/insertName/:id Insert Name User

https://linguityapi-djq5jpbe4a-et.a.run.app/listTeksAudio List Teks Audio

https://linguityapi-djq5jpbe4a-et.a.run.app/articleSearch/:title Article Search By Title

https://linguityapi-djq5jpbe4a-et.a.run.app/listArticle List Article

https://linguityapi-djq5jpbe4a-et.a.run.app/articleById/:id Article By Id

https://linguityapi-djq5jpbe4a-et.a.run.app/spellingListByLevel/:level Spelling List By Level

https://linguityapi-djq5jpbe4a-et.a.run.app/pronunciationListByLevel/:level Pronunciation List By Level

https://linguityapi-djq5jpbe4a-et.a.run.app/spellingListById/:id Spelling List By Id

https://linguityapi-djq5jpbe4a-et.a.run.app/pronunciationListById/:id Pronunciation List By Id

https://linguityapi-djq5jpbe4a-et.a.run.app/checkSpelling/:id Check Spelling

https://linguityapi-djq5jpbe4a-et.a.run.app/checkPronunciation/:id Check Pronunciation
## Cloud Architecture
![DIAGRAM GOOGLE CLOUD](https://github.com/Linguity/CC/assets/85879078/61f4159e-d6eb-4c71-997f-fb96aaad740d)

## How to deploy
1. Clone this repository
2. Docker configuratiion
- docker build -t <Your-image> .
- docker run -p 8090:8090 <Your-image>:<your-tag>
- docker tag <Your-image>:<your-tag> gcr.io/<your-project>/<Your-image>:<your-tag>
- docker push gcr.io/<your-project>/<Your-image>:<your-tag>
3. Then Deploy to Cloud Run
