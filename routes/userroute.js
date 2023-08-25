const express = require('express');
const userRoute = express();
const multer = require('multer');
const upload = multer({dest:'./File'});

const userController = require('../controller/usercontroller');

userRoute.get('/loadbanner',userController.loadbanners);
userRoute.get('/loadfirms',userController.loadfirms);
userRoute.get('/loadFirmdetails',userController.loadfirmdetails);
userRoute.get('/loadprojectdetails',userController.loadprojectdetails);
userRoute.get('/loadsingleproject',userController.loadsingleproject);
userRoute.get('/userchat',userController.userchats)
userRoute.get('/allmessages',userController.allmessages)
userRoute.get('/profile',userController.profile)
userRoute.get('/loadbookings',userController.loadbookings)
userRoute.get('/loadreview',userController.loadreview)
userRoute.get('/profileimg',userController.profileimg);

userRoute.post('/register',userController.postregister);
userRoute.post('/verification',userController.Verification);
userRoute.post('/login',userController.postlogin);
userRoute.post('/active',userController.activeuser);
userRoute.post('/logout',userController.logout);
userRoute.post('/reverification',userController.reverification);
userRoute.post('/forgotpassword',userController.forgotpassword);
userRoute.post('/forgot/:token',userController.forgot);
userRoute.post('/chatconnection',userController.chatconnection);
userRoute.post('/message',userController.addmessage);
userRoute.post('/booking',userController.savebooking);
userRoute.post('/verifypayment',userController.verifypayment);
userRoute.post('/savereview',userController.savereview);
userRoute.post('/payagain',userController.payagain);
userRoute.post('/updateuserprofile',upload.single('image'),userController.updateuserprofile);

module.exports = userRoute;