const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Pro = require('../models/promodel');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const Basicinfo = require('../models/basicinfo');
const BusDetails = require('../models/businessdetails');
const ProjectDetails = require('../models/projectdetails');
const Connection = require('../models/connection');     
const Message = require('../models/message');  
const Booking = require('../models/booking');      

const sendMail = async(name,email,userid)=>{
    try {
        let otp = '';
        let digits = '0123456789';
        for(let i=0;i<4;i++){
            otp+=digits[Math.floor(Math.random()*10)]
        }
        const updateOtp = await Pro.updateOne({_id:userid},{$set:{otp:otp}});
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
                console.log("Email send-->",info.response,otp);
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
        const userdata = await Pro.findOne({_id:id});
        if(otp==userdata.otp){
            await Pro.updateOne({_id:id},{is_varified:true,otp:''});
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
        const record = await Pro.findOne({email:email});

        if(record){
            return res.status(400).send({
                message:"This email is already registered"
            })
        }else{
            const pro = new Pro({
                name:name,
                email:email,
                mobile:mobile,
                password:hashedPassword
            });
            const result = await pro.save();
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
        const userdata = await Pro.findOne({email:email});
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
        const userdata = await Pro.findOne({email:email});
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
        if(!(await bcrypt.compare(password,userdata.password))){
            return res.status(400).send({
                message:"Password is Incorrect"
            })
        }
        const token = jwt.sign({_id:userdata._id},"prosecret");
        res.json(token)
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const activeuser = async(req,res,next)=>{
    try {
        const cookie = req.body.jwt;
        const claims = jwt.verify(cookie,"prosecret");
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }

        const pro = await Pro.findOne({_id:claims._id});
        const {password, ...data} = await pro.toJSON()
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
            html: '<p>Hi '+name+', click this link <a href="http://localhost:4200/pro/renewpassword/token='+token+'">Reset password</a> to reset your password'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email send-->",info.response,);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const forgotpassword = async(req,res,next)=>{
    try {
        const email = req.body.verification;
        const token = randomstring.generate();
        await Pro.updateOne({email:email},{$set:{token:token}});
        const userdata = await Pro.findOne({email:email});
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
        const userdata = await Pro.findOne({token:slice});
        if(userdata){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);
            const passupdate = await Pro.updateOne({password:hashedPassword});
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

const addbasicinfo = async(req,res,next)=>{
    try {
        const userid = req.query.id;
        const companyname = req.body.companyname;
        const city = req.body.city;
        const mobile = req.body.mobile;
        const address = req.body.address;
        const state = req.body.state;
        const country = req.body.country;
        const pincode = req.body.pincode;
        const image = req.file.filename
        const basicinfoData = await Basicinfo.findOne({userid:userid});
        if(basicinfoData){
            return res.status(404).send({
                message:"User allready submited the information"
            })
        }else{
            const basicinfo = new Basicinfo({
                userid:userid,
                companyname:companyname,
                city:city,
                mobile:mobile,
                address:address,
                state:state,
                country:country,
                pincode:pincode,
                image:image,
            })
            const datasave = await basicinfo.save();
            if(datasave){
                res.send({
                    message:"success"
                })
            }else{
                res.status(404);
            }
        }
    } catch (error) {
       next(error);
       console.log(error.message); 
    }
}

const addBusDetails = async(req,res,next)=>{
    try {
        const userid = req.query.id;
        const website = req.body.website;
        const budget = req.body.budget;
        const about = req.body.about;
        const costdetails = req.body.costdetails;
        const businessdescription = req.body.businessdescription;
        const image = req.file.filename;
        const awards = req.body.awards;
        const busDetailsData = await BusDetails.findOne({userid:userid});
        if(busDetailsData){
            return res.status(404).send({
                message:"User already submited the Business Details"
            })
        }else{
            const busDetails = new BusDetails({
                userid:userid,
                website:website,
                budget:budget,
                about:about,
                costdetails:costdetails,
                businessdescription:businessdescription,
                awards:awards,
                image:image,
            })
            const datasave = await busDetails.save();
            if(datasave){
                res.send({
                    message:"success"
                })
            }else{
                res.status(404);    
            }
        }
    } catch (error) {
       next(error);
       console.log(error.message); 
    }
}

const addProjectDetails = async(req,res,next)=>{
    try {
        const userid = req.query.id;
        const projectname = req.body.projectname;
        const projectaddress = req.body.projectaddress;
        const projectcost = req.body.projectcost;
        const projectyear = req.body.projectyear;
        const projectlink = req.body.projectlink;
        const image = [];
        for(let i=0;i<req.files.length;i++){
            image[i] = req.files[i].filename;
        }
        const projectDetailsData = await ProjectDetails.findOne({userid:userid});
        if(projectDetailsData){
            const updatedata = await ProjectDetails.updateOne({userid:userid},{$push:{projects:{
                projectname:projectname,    
                projectaddress:projectaddress,
                projectcost:projectcost,
                projectyear:projectyear,
                projectlink:projectlink,
                image:image
            }}})
            if(updatedata){
                res.send({
                    message:"success"
                })
            }else{
                res.status(404).send({
                    message:"Project added Successfully"
                })
            }
        }else{
            const projectdetails = new ProjectDetails({
                userid:userid,
                projects:[{
                    projectname:projectname,
                    projectaddress:projectaddress,
                    projectcost:projectcost,
                    projectyear:projectyear,
                    projectlink:projectlink,
                    image:image
                }]
            })
            const datasave = await projectdetails.save();
            if(datasave){
                res.send({
                    message:"success"
                })
            }else{
                res.status(404);    
            }
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadfirmbasic = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const basicdata = await Basicinfo.findOne({userid:id});
        res.json(basicdata)
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

const loaddetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const busdetails = await BusDetails.findOne({userid:id});
        res.json(busdetails)
    } catch (error) {
        next(error)
        console.log(error.message);
    }
}

const loadprojectdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const projectdata = await ProjectDetails.findOne({userid:id});
        const one = projectdata.projects
        res.json(one)
    } catch (error) {
        next(error)
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

const loadfirmdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const firmdata = await Basicinfo.findOne({userid:id});
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

const loadbusdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const busdetails = await BusDetails.findOne({userid:id});
        res.json(busdetails);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const updatebusdetails = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const website = req.body.website;
        const budget = req.body.budget;
        const about = req.body.about;
        const costdetails = req.body.costdetails;
        const businessdescription = req.body.businessdescription;
        const awards = req.body.awards;
        const image = req.file.filename;
        const updatedata = await BusDetails.updateOne({userid:id},{$set:{
            website:website,
            budget:budget,
            about:about,
            businessdescription:businessdescription,
            costdetails:costdetails,
            awards:awards,
            image:image
        }})
        if(updatedata){
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

const editproject = async(req,res,next)=>{
    try {
        const id = req.query.id;
        const name = req.query.name;
        const address = req.query.address;
        const projectname = req.body.projectname;
        const projectaddress = req.body.projectaddress;
        const projectcost = req.body.projectcost;
        const projectyear = req.body.projectyear;
        const projectlink = req.body.projectlink;
        const image = [];
        for(let i=0;i<req.files.length;i++){
            image[i] = req.files[i].filename;
        }
        // const deletedata = await ProjectDetails.updateOne({userid:id},{$pull:{projects:{projectname:name,projectaddress:address}}})
        // const data = await ProjectDetails.updateOne({userid:id},{$push:{projects:{
        //     projectname:projectname,
        //     projectaddress:projectaddress,
        //     projectcost:projectcost,
        //     projectlink:projectlink,
        //     projectyear:projectyear,
        //     image:image
        // }}})
        const data = await ProjectDetails.updateOne({userid:id,"projects.projectname":name,"projects.projectaddress":address},{$set:{
            "projects.$.projectname":projectname,
            "projects.$.projectaddress":projectaddress,
            "projects.$.projectcost":projectcost,
            "projects.$.projectlink":projectlink,
            "projects.$.projectyear":projectyear,
            "projects.$.image":image
        }})
        res.json(data)
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const professionalchatlist = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"prosecret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        console.log(claims._id);

        const user = await Connection.find({"connections.professional":claims._id}).populate("connections.user");
        console.log(user);
        res.json({data:user,id:claims._id});
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const findchat = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userid = req.query.id;
        const claims = jwt.verify(token,"prosecret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const proid = claims._id;
        const findconnection = await Connection.findOne({"connections.user":userid,"connections.professional":proid});
        if(findconnection){
            const allmessages = await Message.find({connectionid:findconnection._id}).sort('createdAt');
            res.json({
                result:allmessages,
                cid:findconnection._id,
                prof:findconnection.connections.professional
            })
        }else{
            res.status(404);
        }
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const message = async(req,res,next)=>{
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

const proprofile = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"prosecret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const proid = claims._id;
        const data = await Pro.findOne({_id:proid});
        res.json(data);
    } catch (error) {
        next(error);
        console.log(error.message);
    }
}

const loadprobookings = async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const claims = jwt.verify(token,"prosecret")
        if(!claims){
            return res.status(401).send({
                message:"unauthenticated"
            })
        }
        const proid = claims._id;
        const data = await Booking.find({professional:proid});
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
    logout,
    reverification,
    forgot,
    forgotpassword,
    addbasicinfo,
    addBusDetails,
    addProjectDetails,
    loadfirmbasic,
    loaddetails,
    loadprojectdetails,
    loadsingleproject,
    loadfirmdetails,
    updatefirmdetails,
    loadbusdetails,
    updatebusdetails,
    editproject,
    professionalchatlist,
    findchat,
    message,
    proprofile,
    loadprobookings
}