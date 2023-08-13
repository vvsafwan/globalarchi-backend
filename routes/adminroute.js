const express = require('express');
const adminRoute = express();
const multer = require('multer');
const upload = multer({dest:'./File'});

const adminController = require('../controller/admincontroller');

adminRoute.get('/loadUsers',adminController.loadUser);
adminRoute.get('/loadBanners',adminController.loadBanners);
adminRoute.get('/loadFirms',adminController.loadFirms);
adminRoute.get('/loadPro',adminController.loadPro);
adminRoute.get('/loadfirmdetails',adminController.loadfirmdetails);
adminRoute.get('/loadbusinessdetails',adminController.loadbusinessdetails);
adminRoute.get('/loaddatas',adminController.loaddatas);
adminRoute.get('/loadBookings',adminController.loadBookings);

adminRoute.post('/login',adminController.postlogin);
adminRoute.post('/addbanner',upload.single('image'),adminController.addbanner);
adminRoute.post('/active',adminController.activeadmin);
adminRoute.post('/blockuser',adminController.blockUser);
adminRoute.post('/unblockuser',adminController.unblockUser);
adminRoute.post('/unlistbanner',adminController.unlistbanner);
adminRoute.post('/listbanner',adminController.listbanner);
adminRoute.post('/logout',adminController.logout);
adminRoute.patch('/blockfirm',adminController.blockFirm);
adminRoute.patch('/unblockfirm',adminController.unBlockFirm);
adminRoute.patch('/blockPro',adminController.blockPro);
adminRoute.patch('/unblockPro',adminController.unBlockPro);
adminRoute.post('/updatebasicfirm',upload.single('image'),adminController.updatefirmdetails);
adminRoute.post('/verifybus',adminController.verifybus);
adminRoute.post('/unverifybus',adminController.unverifybus);

module.exports = adminRoute;