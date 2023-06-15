import mysql from 'mysql2';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import axios from 'axios';


dotenv.config();

const database = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBDATABASE
  })
  

  const storage = new Storage({
    projectId: process.env.PROJECTID,
    keyFilename: './key.json' 
  })
  const nameBucket = process.env.BUCKETNAME


  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }).single('file')


  export function register(req, res) {
    const { name, email, password } = req.body;
    database.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      (err, result) => {
        if (err) {
          return res.status(500).json({ status: "Error", msg: "Error" });
        }
        if (result.length !== 0) {
          return res.status(400).json({ status: "Error", msg: "Email already exists" });
        }
        const secretKey = process.env.SECRETKEY;
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        database.query(
          "INSERT INTO user (`name`, `email`, `password`) VALUES (?, ?, ?)",
          [name, email, hashPassword],
          (err, row) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ status: "Error", msg: "Error" });
            }
            if (row.affectedRows !== 0) {
              const tokenId = jwt.sign({ id: row.insertId, email: row.email }, secretKey, { expiresIn: 5 * 24 * 60 * 60 });
              database.query(
                "UPDATE user SET `token` = ? WHERE `id` = ?",
                [tokenId, row.insertId],
                (err, updateResult) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ status: "Error", msg: "Database error" });
                  }
                  return res.status(200).json({ status: "Success", msg: "Registration successful", tokenId });
                }
              );
            } else {
              return res.status(400).json({ status: "Error", msg: "Invalid login" });
            }
          }
        );
      }
    );
  }
  
  let globalToken = ''
export function login(req, res){
    const {email, password} = req.body
    database.query(
      "SELECT * FROM user WHERE `email` = ? ", 
      [email], 
      (err, rows) => {
        if (err) {
          res.status(500).json({ status:"Error", msg: "Database error" })
        }
        if (rows.length === 0) {
          res.status(400).json({ status: "Error", msg: "Invalid email or password" });
        }
        const user = rows[0]
        const match = bcrypt.compareSync(password, user.password)
          if (match) {
            const secretKey = process.env.SECRETKEY
            const tokenIdl = jwt.sign({id: user.id, email: user.email}, secretKey, { expiresIn : 5 * 24 * 60 * 60})
            database.query(
              "UPDATE user SET `token` = ? WHERE `id` = ?",
              [tokenIdl, user.id],
              (err, result) => {
                if (err) {
                  res.status(500).json({ status:"Error", msg: "Database error" })
                }
                globalToken=tokenIdl
                res.status(200).json({ status: "Success", msg: "Login Success", tokenIdl, name: user.name, email: user.email, image: user.imageUrl  })
              }
            );
          } else {
            res.status(400).json({ status: "Error", msg: "Invalid email or password" })
          }
        })
  }


export function insertName(req,res){
    const id = req.params.id
    const {name }= req.body
    database.query(
      "UPDATE user set name = ? WHERE id = ?", 
      [name, id], 
      (err,result) => {
        if(err){
            return res.status(500).json({status: "Error", msg: 'Error save data'})
        }
         return res.status(200).json({status: "Success", msg: 'success input name'})
    })
}

export function uploadimage(req,res) {
  const id = req.params.id
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ status: "Error", msg: 'Error upload image' })
    }
    if (!req.file) {
      return res.status(404).json({ status: "Error", msg: 'No file upload' })
    }
    const gcsname = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const bucket = storage.bucket(nameBucket)
    const fileUpload = bucket.file(gcsname)
    const up = fileUpload.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    })
    up.on('error', (err) => {
      console.error(err)
      return res.status(500).json({ status: "Error", msg: 'Error upload image to GCP' })
    })
    up.on('finish', () => {
      console.error(err)
      const url = `https://storage.googleapis.com/${nameBucket}/${gcsname}`
      database.query(
        "UPDATE user set imageUrl = ? WHERE id = ? ", 
        [url, id], 
        (err, result) => {
        if (err) {
          return res.status(500).json({ status: "Error", msg: 'Error save image' })
        }
        return res.status(200).json({ status: "Success", msg : "Success upload image", image: url })
      })
    })
    up.end(req.file.buffer)
  })
}






export function user(req,res){
    const id = req.params.id
    database.query(
        "SELECT * FROM user WHERE id = ?",
        [id],
        (err,row) => {
            if(err){
                res.status(500).json({status:"Error", msg: "Failed get data user"})
            }
            res.status(200).json({status:"Success", msg:"Success get list user", row})
        }
    )
}

export function articleview(req,res){
  const id = req.params.id
  database.query(
      "SELECT * FROM article WHERE id = ?",
      [id],
      (err,row) => {
          if(err){
              return res.status(500).json({status:"Error", msg: "Failed get data user"})
          }
          if(row.length === 0){
            return res.status(400).json({status:"Error", msg: "Article not found"})
          }
          return res.status(200).json({status:"Success", msg:"Success get article", row})
      }
  )
}

export function articleviewsearch(req,res){
  const title = req.params.title
  database.query(
      "SELECT * FROM article WHERE title = ?",
      [title],
      (err,row) => {
          if(err){
              return res.status(500).json({status:"Error", msg: "Failed get data article"})
          }
          if(row.length === 0){
            return res.status(400).json({status:"Error", msg: "Article not found"})
          }
          return res.status(200).json({status:"Success", msg:"Success get article", row})
      }
  )
}

export function spellingListBylevel(req,res){
  const level = req.params.level
  database.query(
    "SELECT q.id, q.text, q.is_open, IFNULL(h.is_answered, false) AS is_answered FROM spelling q LEFT JOIN historyUserSpelling h ON h.id_quiz = q.id WHERE q.level = ?",
    [level],
    (err,row) => {
        if(err){
            return res.status(500).json({status:"Error", msg: "Failed get data quiz"})
        }
        if(row.length === 0){
          return res.status(400).json({status:"Error", msg: "Quiz not found"})
        }
        return res.status(200).json({status:"Success", msg:"Success get Quiz List", row})
    }
)
}

export function PronunciationListBylevel(req,res){
  const level = req.params.level
  database.query(
    "SELECT q.id, q.text, q.is_open, IFNULL(h.is_answered, false) AS is_answered FROM pronunciation q LEFT JOIN historyUserPnonunciation h ON h.id_quiz = q.id WHERE q.level = ?",
    [level],
    (err,row) => {
        if(err){
            return res.status(500).json({status:"Error", msg: "Failed get data quiz"})
        }
        if(row.length === 0){
          return res.status(400).json({status:"Error", msg: "Quiz not found"})
        }
        return res.status(200).json({status:"Success", msg:"Success get Quiz List", row})
    }
)
}

export function SpellingListById(req,res){
  const id = req.params.id
  database.query(
    "SELECT q.id, q.text, q.is_open, IFNULL(h.is_answered, false) AS is_answered FROM spelling q LEFT JOIN historyUserSpelling h ON h.id_quiz = q.id WHERE q.id = ?",
    [id],
    (err,row) => {
        if(err){
            return res.status(500).json({status:"Error", msg: "Failed get data quiz"})
        }
        if(row.length === 0){
          return res.status(400).json({status:"Error", msg: "Quiz not found"})
        }
        return res.status(200).json({status:"Success", msg:"Success get Quiz Spelling List", row})
    }
)
}

export function PronunciationListById(req,res){
  const id = req.params.id
  database.query(
    "SELECT q.id, q.text, q.is_open, IFNULL(h.is_answered, false) AS is_answered FROM pronunciation q LEFT JOIN historyUserPnonunciation h ON h.id_quiz = q.id WHERE q.id = ?",
    [id],
    (err,row) => {
        if(err){
            return res.status(500).json({status:"Error", msg: "Failed get data quiz"})
        }
        if(row.length === 0){
          return res.status(400).json({status:"Error", msg: "Quiz not found"})
        }
        return res.status(200).json({status:"Success", msg:"Success get Quiz Pronunciation List", row})
    }
)
}

export function postSpellingById(req, res) {
  const id = req.params.id;
  const token = req.headers.authorization;

  const extractedToken = token.split(' ')[1]; 
  jwt.verify(extractedToken, process.env.SECRETKEY, (err, decoded) => {
    if (err) {
      console.error('Error verifying JWT:', err);
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const idUser = decoded.id;

      database.query(
        `SELECT text FROM spelling WHERE id = ?`,
        [id],
        (err, result) => {
          if (err) {
            console.error('Error executing SQL query:', err);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
            return;
          }
          if (result.length === 0) {
            res.status(404).json({ success: false, error: 'Quiz not found' });
            return;
          }

          const teks_quiz = result[0].text;

        upload(req, res, (err) => {
          if (err) {
            console.error('Error uploading file:', err);
            res.status(500).json({ success: false, error: 'File upload error' });
            return;
          }

          const filename = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const bucket = storage.bucket(nameBucket);
          const fileUpload = bucket.file(filename);
          const up = fileUpload.createWriteStream();
          up.end(req.file.buffer);
          const file = `https://storage.googleapis.com/${nameBucket}/${filename}`;

          
          async function sendToML(url, teks_quiz) {
            try {
              const mlUrl = 'https://linguitymlspellapi-djq5jpbe4a-et.a.run.app/spelling';
              const requestBody = JSON.stringify({
                file: url,
                label: teks_quiz,
              });
              customConfig = {
                headers: {
                  'Content-Type': 'application/json'
                }
              };
              const response = await axios.post(mlUrl, requestBody, customConfig);

              return response.data.checkk;
            } catch (error) {
              console.error('Error:', error);
              throw error;
            }
          }

          sendToML(file, teks_quiz)
            .then((checkResult) => {
              let resultMessage = '';
              if (checkResult) {
                resultMessage = 'Perfect';
              } else {
                resultMessage = 'Not Bad';
              }

              database.query(
                "INSERT INTO historyUserSpelling (id_user, id_quiz, is_answered, checker) VALUES (?,?,true,?)",
                [idUser, id_quiz, checkResult],
                (err, result) => {
                  if (err) {
                    console.error('Error executing SQL query:', err);
                    res.status(500).json({ success: false, error: 'Internal Server Error' });
                    return;
                  }
                  res.json({ success: true, result });
                }
              );
            })
            .catch((error) => {
              console.error('Error:', error);
              res.status(500).json({ success: false, error: 'Internal Server Error' });
            });
        });
      }
    );
  });
}




// export function postSpellingById(req,res){

// }
