const express = require('express');
const proRoute = express();
const multer = require('multer');
const upload = multer({dest:'./File'});

const proController = require('../controller/procontroller');

proRoute.get('/loadfirmbasic',proController.loadfirmbasic);
proRoute.get('/loaddetails',proController.loaddetails);
proRoute.get('/loadprojectdetails',proController.loadprojectdetails);
proRoute.get('/loadsingleproject',proController.loadsingleproject);
proRoute.get('/loadfirmdetails',proController.loadfirmdetails);
proRoute.get('/loadbusdetails',proController.loadbusdetails);
proRoute.get('/editproject',proController.editproject);
proRoute.get('/professionalchatlist',proController.professionalchatlist);
proRoute.get('/findchat',proController.findchat);
proRoute.get('/proprofile',proController.proprofile);
proRoute.get('/loadprobookings',proController.loadprobookings);
proRoute.get('/loaduserprofile',proController.loaduserprofile);
proRoute.get('/loadmyimg',proController.loadmyimg);

proRoute.post('/register',proController.postregister);
proRoute.post('/verification',proController.Verification);
proRoute.post('/login',proController.postlogin);
proRoute.post('/active',proController.activeuser);
proRoute.post('/logout',proController.logout);
proRoute.post('/reverification',proController.reverification);
proRoute.post('/forgotpassword',proController.forgotpassword);
proRoute.post('/forgot/:token',proController.forgot);
proRoute.post('/basicinfo',upload.single('image'),proController.addbasicinfo);
proRoute.post('/businessdetails',upload.single('image'),proController.addBusDetails);
proRoute.post('/projectdetails',upload.array('image',10),proController.addProjectDetails);
proRoute.post('/updatebasicfirm',upload.single('image'),proController.updatefirmdetails);
proRoute.post('/updatebusdetails',upload.single('image'),proController.updatebusdetails);
proRoute.post('/editproject',upload.array('image',10),proController.editproject);
proRoute.post('/message',proController.message);

module.exports = proRoute;