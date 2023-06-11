import mysql from 'mysql2';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';


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


export function register(req, res){
    const {name, email, password} = req.body
    database.query(
      "SELECT * FROM user WHERE email = ? ", 
      [email], 
      (err, result) => {
        if (err) {
            return res.status(500).json({status:  "Error", msg: 'error' })
        }
        if (result.length !== 0) {
            return res.status(400).json({status: "Error", msg: 'email already exist' })
        }
        const secretKey = process.env.SECRETKEY
        const salt = bcrypt.genSaltSync(10)
        const hashPassword = bcrypt.hashSync(password,salt)
        database.query(
          "INSERT INTO user (`name`,`email`,`password`) VALUES (?,?,?)", 
          [name, email, hashPassword], 
          (err, row) => {
            if (err) {
              console.error(err)
                return res.status(500).json({status:"Error", msg: 'error' })
            }
            if(row !== 0){
                const tokenId = jwt.sign({id: row.id, email: row.email}, secretKey, { expiresIn : 5 * 24 * 60 * 60})
                return res.status(200).json({ status: "Success", msg: 'berhasil register dan login', tokenId })
            }
            return res.json(400).json({status: "Error", msg: "invalid login"})
        });
    });
}

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
            const tokenId = jwt.sign({id: user.id, email: user.email}, secretKey, { expiresIn : 5 * 24 * 60 * 60})
            res.status(200).json({ status: "Success", msg: "login success" ,  tokenId})
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

export function randomQuizByLevelChooseOne (req,res) {
  const level = req.params.level
    database.query(
      "SELECT teksQuiz FROM audioteks WHERE level = ? ORDER BY RAND() LIMIT 1", 
      [level], 
      (err, result) => {
      if (err) {
        return res.status(500).json({status: "Error", msg: 'Error retrieving random text from database' })
      }
      if(result.length === 0){
        return res.status(400).json({status: "Error", msg: "Data quiz not found"})
      }
      const text = result.length > 0 ? result[0].teksQuiz : null
      return res.status(200).json({ status: "Success", msg: "Success get data teks quiz", text })
    })
  }
  
export function randomQuizByLevel(req, res){  
    const level = req.params.level
    database.query(
      "SELECT teksQuiz FROM audioteks WHERE level = ? LIMIT 100", 
      [level], 
      (err, result) => {
      if (err) {
        return res.status(500).json({ status: "Error", msg: 'Error retrieving random text from database' })
      }if(result.length === 0){
        return res.status(400).json({status: "Error", msg: "Data quiz not found"})
      }
      return res.status(200).json({ status: "Success", msg: "Success get list quiz by level", result })
    })
  }
export function randomQuizById(req, res){  
    const id = req.params.id
    database.query(
      "SELECT teksQuiz FROM audioteks WHERE id = ?", 
      [id], 
      (err, result) => {
      if (err) {
        return res.status(500).json({ status: "Error", msg: 'Error retrieving random text from database' })
      }if(result.length === 0){
        return res.status(400).json({status: "Error", msg: "Data quiz not found"})
      }
      return res.status(200).json({ status: "Success", msg: "Success get list quiz by level", result })
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


