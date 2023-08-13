const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/usermodel');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const Banner = require('../models/bannermodel');
const Basicinfo = require('../models/basicinfo');
const BusDetails = require('../models/businessdetails');
const ProjectDetails = require('../models/projectdetails');
const Connection = require('../models/connection');
const Message = require('../models/message');
const Booking = require('../models/booking');
const Review = require('../models/reviewmodel')

const sendMail = async(name,email,userid)=>{
    try {
        let otp = '';
        let digits = '0123456789';
        for(let i=0;i<4;i++){
            otp+=digits[Math.floor(Math.random()*10)]
        }
        console.log(otp);
        const updateOtp = await User.updateOne({_id:userid},{$set:{otp:otp}});
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user: 'vvsafwan2002@gmail.com',
                pass: process.env.PASS
            }
        })
        const mailOptions = {
            from: 'vvsafwan2002@gmail.com',
            to: email,
            subject: 'For verification mail',
            html: '<p>Hi '+name+', Your otp for verification is '+otp+'.Enter the otp and verify you account'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email send-->",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const sendreset = async(name,email,token)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user: 'vvsafwan2002@gmail.com',
                pass: 'kikppwpowovdnpur'
            }
        })
        const mailOptions = {
            from: 'vvsafwan2002@gmail.com',
            to: email,
            subject: 'For Reset Password',
            html: '<p>Hi '+name+', click this link <a href="http://localhost:4200/renewpassword/token='+token+'">Reset password</a> to reset your password'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email send-->",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const Verification = async(req,res,next)=>{
    try {
        const otp = req.body.verification;
        const id = req.query.id;
        const userdata = await User.findOne({_id:id});
        if(otp==userdata.otp){
            await User.updateOne({_id:id},{is_varified:true,otp:''});
            res.send({
                message:"success"
            })
        }else{
            res.status(400).send({
                message:"Otp is incorrect"
            })
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const postregister = async(req,res,next)=>{
    try {
        let name = req.body.name;
        let email = req.body.email;
        let mobile = req.body.mobile;
        let password = req.body.password;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const record = await User.findOne({email:email});

        if(record){
            return res.status(400).send({
                message:"This email is already registered"
            })
        }else{
            const user = new User({
                name:name,
                email:email,
                mobile:mobile,
                password:hashedPassword
            });
            const result = await user.save();
            if(result){
                sendMail(result.name,result.email,result._id);
                res.json(result)
            }else{
                res.status(400).send({
                    message:"Can't registered, Something went wrong"
                })
            }
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const reverification = async(req,res,next)=>{
    try {
        let email = req.body.email;
        const userdata = await User.findOne({email:email});
        sendMail(userdata.name,userdata.email,userdata._id);
        res.json(userdata);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const postlogin = async(req,res,next)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userdata = await User.findOne({email:email});
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
        if(userdata.is_blocked){
            return res.status(404).send({
                message:"User is blocked"
            })
        }
        if(!(await bcrypt.compare(password,userdata.password))){
            return res.status(400).send({
                message:"Password is Incorrect"
            })
        }
        const token = jwt.sign({_id:userdata._id},"secret");
        res.json(token)
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const activeuser = async(req,res,next)=>{
    try {
        const cookie = req.body.jwt;
        const claims = jwt.verify(cookie,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }

        const user = await User.findOne({_id:claims._id});
        const {password, ...data} = await user.toJSON()
        res.send(data)
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

const forgotpassword = async(req,res,next)=>{
    try {
        const email = req.body.verification;
        const token = randomstring.generate();
        await User.updateOne({email:email},{$set:{token:token}});
        const userdata = await User.findOne({email:email});
        sendreset(userdata.name,userdata.email,token);
        res.send({
            message:"success"
        })
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const forgot = async(req,res,next)=>{
    try {
        const token = req.params.token;
        const slice = token.slice(6)
        const password = req.body.verification;
        const userdata = await User.findOne({token:slice});
        if(userdata){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);
            const passupdate = await User.updateOne({password:hashedPassword});
            if(passupdate){
                res.send({
                    message:"success"
                })
            }else{
                res.status(404);
            }
        }else{
            res.status(404)
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadbanners = async(req,res,next)=>{
    try {
        const bannerdata = await Banner.find({status:true});
        if(bannerdata){
            res.json(bannerdata);
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadfirms = async(req,res,next)=>{
    try {
        const firmdata = await Basicinfo.find({is_blocked:false});
        if(firmdata){
            res.json(firmdata);
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadfirmdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const firmdetails = await BusDetails.findOne({userid:id});
        const basicdetails = await Basicinfo.findOne({userid:id});
        if(firmdetails){
            res.json({firmdetails,basicdetails});
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadprojectdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const projectdata = await ProjectDetails.findOne({userid:id})
        if(projectdata){
            const project = projectdata.projects;
            res.json(project);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadsingleproject = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const name = req.query.name;
        const address = req.query.address;
        const projectdata = await ProjectDetails.findOne({userid:id});
        const projectarray = projectdata.projects;
        let one;
        for(let project of projectarray){
            if(project.projectname==name&&project.projectaddress==address){
                one = project;
            }
        }
        res.json(one);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const userchats = async (req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }

        const user = await Connection.find({"connections.user":claims._id}).populate("connections.professional");
        res.json({data:user,id:claims._id});
    } catch (error) {
        next(error)
    }
}

const chatconnection = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const proid = req.query.id;
        console.log(token);
        const claims = jwt.verify(token,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const data = await Connection.findOne({"connections.user":claims._id,"connections.professional":proid});
        if(data){
            res.send({
                message:"success"
            })
        }else{
            const newdata = new Connection({
                connections:{
                    user:claims._id,
                    professional:proid
                }
            })
            const savedata = await newdata.save();
            if(savedata){
                res.send({
                    message:"success"
                })
            }
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const addmessage = async(req,res,next)=>{
    try {
        const datas = req.body;
        const result = new Message({
            connectionid:datas.connectionid,
            from:datas.from,
            to:datas.to,
            message:datas.message
        })
        const data = await result.save();
        res.json(data)
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const allmessages = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const proid = req.query.id;
        const claims = jwt.verify(token,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const userid = claims._id;
        const findconnection = await Connection.findOne({"connections.user":userid,"connections.professional":proid});
        if(findconnection){
            const allmessages = await Message.find({connectionid:findconnection._id}).sort('createdAt');
            res.json({
                result:allmessages,
                cid:findconnection._id,
                userid:findconnection.connections.user
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const savebooking = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const userid = claims._id;
        const proid = req.query.id;
        const {name,place,mobile,address,state,country,pincode,date} = req.body;
        const data = await Booking.findOne({professional:proid,user:userid})
        if(data){
            res.status(404).send({
                message:"You have already booked to this architecture"
            })
        }else{
            const booking = new Booking({
                professional:proid,
                user:userid,
                name:name,
                place:place,
                mobile:mobile,
                state:state,
                address:address,
                country:country,
                pincode:pincode,
                date:date
            })
            const savebooking = await booking.save();
            res.json(savebooking);
        }
       
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const verifypayment = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const userid = claims._id;
        const proid = req.query.id
        const paymentId = req.body.razorpay_payment_id;
        const status = req.body.status_code;
        if(status==200){
            const data = await Booking.updateOne({professional:proid,user:userid},{$set:{paymentId:paymentId,status:true}});
            res.send({
                message:"success"
            })
        }else{
            const data = await Booking.updateOne({professional:proid,user:userid},{$set:{paymentId:paymentId,status:false}});
            res.status(404).send({
                message: "payment failed"
            })
        }
        res.json(req.body);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const profile = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const userid = claims._id;
        const data = await User.findOne({_id:userid});
        res.json(data);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadbookings = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"secret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const userid = claims._id;
        const data = await Booking.find({user:userid}).populate("professional");
        console.log(data);
        res.json(data);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const savereview = async(req,res,next)=>{
    try {
        const proid = req.query.id;
        console.log(req.body);
        const review = req.body.review;
        // console.log(review);
        const rating = req.body.rating;
        const name = req.body.name;
        console.log(rating);
        const add = new Review({
            proid:proid,
            name:name,
            review:review,
            rating:rating
        })
        const data = await add.save();
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

const loadreview = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const data = await Review.find({proid:id})
        res.json(data);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

module.exports = {
    postregister,
    Verification,
    postlogin,
    activeuser,
    reverification,
    logout,
    forgotpassword,
    forgot,
    loadbanners,
    loadfirms,
    loadfirmdetails,
    loadprojectdetails,
    loadsingleproject,
    userchats,
    chatconnection,
    addmessage,
    allmessages,
    savebooking,
    verifypayment,
    profile,
    loadbookings,
    savereview,
    loadreview
}