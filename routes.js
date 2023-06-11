import express from 'express';
import { addadmin, loginAdmin, logoutAdmin, home, countUser, listAdmin, listUser, deleteUser, addTeksAudio, deleteTeksAudio, listartikel, addArtikel, deleteArticle, listTeksAudio, addUser } from './WebCms.js';
import { register, login, user,  insertName, randomQuizByLevelChooseOne, randomQuizByLevel,  uploadimage, articleview, randomQuizById } from './Mobile.js';


const routes= express.Router();

// for Website CMS
routes.get('/home', home)
routes.get('/countUser', countUser)

routes.post('/addadmin', addadmin)
routes.post('/loginAdmin', loginAdmin)
routes.delete('/logoutAdmin', logoutAdmin)
routes.get('/listadmin', listAdmin)


routes.get('/listuser', listUser)
routes.delete('/deleteUser/:id', deleteUser)
routes.post('/addUser', addUser)

routes.get('/listTeksAudio', listTeksAudio)
routes.post('/addTeksAudio', addTeksAudio)
routes.delete('/deleteTeksAudio/:id', deleteTeksAudio)

routes.get('/listartikel', listartikel)
routes.post('/addArtikel', addArtikel)
routes.delete('/deleteArtikel/:id', deleteArticle)

// for Mobile
routes.post('/register', register)
routes.post('/login', login)
routes.get('/user/:id', user)
routes.put('/uploadImage/:id', uploadimage)
routes.put('/insertName/:id', insertName)
routes.get('/artikel/:id', articleview)
routes.get('/randomQuizByLevelChooseOne/:level', randomQuizByLevelChooseOne)
routes.get('/randomQuizByLevel/:level', randomQuizByLevel)
routes.get('/randomQuizById/:id', randomQuizById)

export default routes;