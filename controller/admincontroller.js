const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Banner = require('../models/bannermodel');
const Basicinfo = require('../models/basicinfo');
const Pro = require('../models/promodel');
const BusDetails = require('../models/businessdetails');
const Booking = require('../models/booking');

const postlogin = async(req,res,next)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userdata = await User.findOne({email:email})
        if(!userdata){
            return res.status(404).send({
                message:"User not found"
            })
        }
        if(!userdata.is_varified){
            return res.status(404).send({
                message:"User not verified"
            })
        }
        if(!userdata.is_admin){
            return res.status(404).send({
                message:"You are not admin"
            })
        }
        if(!(await bcrypt.compare(password,userdata.password))){
            return res.status(400).send({
                message:"Password is Incorrect"
            })
        }
        const token = jwt.sign({_id:userdata._id},"adminsecret");
        res.json(token)
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const addbanner = async(req,res,next)=>{
    try {
        const header = req.body.header;
        const description = req.body.description;
        const image = req.file.filename;
        const banner = new Banner({
            header:header,
            description:description,
            image:image
        })
        const updatebanner = await banner.save();
        if(updatebanner){   
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
    }
}

const activeadmin = async(req,res,next)=>{
    try {
        const cookie = req.body.jwt;
        const claims = jwt.verify(cookie,"adminsecret");
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }

        const pro = await User.findOne({_id:claims._id,is_admin:true});
        const {password, ...data} = await pro.toJSON()
        res.send(data)
    } catch (error) {
        next(error)
    }
}

const loadUser = async(req,res,next)=>{
    try {
       const userdata = await User.find({is_admin:false});
       res.json(userdata); 
    } catch (error) {
        next(error)
    }
}

const blockUser = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const userdata = await User.updateOne({_id:id},{$set:{is_blocked:true}});
        if(userdata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const unblockUser = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const userdata = await User.updateOne({_id:id},{$set:{is_blocked:false}});
        if(userdata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const loadBanners = async(req,res,next)=>{
    try {
       const userdata = await Banner.find({});
       res.json(userdata); 
    } catch (error) {
        next(error)
    }
}

const unlistbanner = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const bannerdata = await Banner.updateOne({_id:id},{$set:{status:false}});
        if(bannerdata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const listbanner = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const bannerdata = await Banner.updateOne({_id:id},{$set:{status:true}});
        if(bannerdata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const logout = async(req,res,next)=>{
    try {
        res.send({
            message:"success"
        })
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadFirms = async(req,res,next)=>{
    try {
        const firmdata = await Basicinfo.find({});
        res.json(firmdata);
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

const blockFirm = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const firmdata = await Basicinfo.updateOne({_id:id},{$set:{is_blocked:true}});
        if(firmdata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const unBlockFirm = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const firmdata = await Basicinfo.updateOne({_id:id},{$set:{is_blocked:false}});
        if(firmdata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const loadPro = async(req,res,next)=>{
    try {
        const prodata = await Pro.find({});
        res.json(prodata);
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

const blockPro = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const prodata = await Pro.updateOne({_id:id},{$set:{is_blocked:true}});
        if(prodata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const unBlockPro = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const prodata = await Pro.updateOne({_id:id},{$set:{is_blocked:false}});
        if(prodata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error)
    }
}

const loadfirmdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const firmdata = await Basicinfo.findOne({_id:id});
        res.json(firmdata);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const updatefirmdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const companyname = req.body.companyname;
        const country = req.body.country;
        const address = req.body.address;
        const city = req.body.city;
        const state = req.body.state;
        const mobile = req.body.mobile;
        const image = req.file.filename;
        const pincode = req.body.pincode;
        const updatedate = await Basicinfo.updateOne({_id:id},{$set:{
            companyname:companyname,
            country:country,
            state:state,
            city:city,
            mobile:mobile,
            address:address,
            pincode:pincode,
            image:image
        }})
        if(updatedate){
            res.send({
                message:"success"
            })
        }else{
            res.status(404)
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadbusinessdetails = async(req,res,next)=>{
    try {
        const data = await BusDetails.findOne({userid:req.query.id});
        console.log(data);
        if(data){
            res.json(data);
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const verifybus = async (req,res,next)=>{
    try {
        const id = req.query.id;
        const updatedata = await BusDetails.updateOne({_id:id},{$set:{is_varified:true}})
        if(updatedata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const unverifybus = async (req,res,next)=>{
    try {
        const id = req.query.id;
        const updatedata = await BusDetails.updateOne({_id:id},{$set:{is_varified:false}})
        if(updatedata){
            res.send({
                message:"success"
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loaddatas = async(req,res,next)=>{
    try {
       const usercount = await User.find().count();
       const procount = await Pro.find().count();
       const firmcount = await Basicinfo.find().count();
       const bookingcount = await Booking.find().count();
       const bannercount = await Banner.find().count();
       const paymentSuccess = await Booking.find({status:true}).count();
       const paymentFailure = await Booking.find({status:false}).count();
       const money = 2000 * parseInt(paymentSuccess)
       const moneyfailed = 2000 * parseInt(paymentFailure)
       const data = {
        usercount:usercount,
        procount:procount,
        firmcount:firmcount,
        bookingcount:bookingcount,
        bannercount:bannercount,
        money:money,
        moneyfailed:moneyfailed
       }
       res.json(data)
    } catch (error) {
        next(error)
    }
}

const loadBookings = async (req,res,next)=>{
    try {
       const data = await Booking.find();
       res.json(data);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

module.exports = {
    postlogin,
    addbanner,
    activeadmin,
    loadUser,
    blockUser,
    unblockUser,
    loadBanners,
    unlistbanner,
    listbanner,
    logout,
    loadFirms,
    blockFirm,
    unBlockFirm,
    loadPro,
    blockPro,
    unBlockPro,
    loadfirmdetails,
    updatefirmdetails,
    loadbusinessdetails,
    verifybus,
    unverifybus,
    loaddatas,
    loadBookings
}