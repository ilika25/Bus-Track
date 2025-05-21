const express= require('express');
const port= 3000;
const app= express();
const path= require('path')
const mongoose= require('mongoose')
const bodyParser= require('body-parser')
const bcrypt= require('bcryptjs')
const User= require('./models/user')
const Driver= require('./models/driver')
const http = require("http");
const socketIO = require("socket.io");

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
const server= http.createServer(app);
const io= socketIO(server);
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/userview", (req, res) => {
  res.render("userview");
});
mongoose.connect('mongodb://localhost:27017/bustrack')
.then(()=> console.log("Connected to MongoDB"))
.catch(err=> console.log("Error connecting to MongoDB",err))
app.set('view engine','ejs')
app.get('/loginuser',(req,res)=>{
    res.render('loginuser')
})
app.get('/logindriver',(req,res)=>{
    res.render('logindriver')
})
io.on("connection",(socket)=>{
    console.log("New client!");

    socket.on("sendLocation",(location)=>{
        socket.broadcast.emit("receiveLocation",location);
    });

    socket.on("disconnect",()=>{
        console.log("Client disconnected");
    });
});
app.post('/loginuser',async (req,res)=>{
    const username= req.body.username
    const password= req.body.password
    try{
        const user= await User.findOne({username});
        if(!user){
            return res.status(400).send(`<script>alert('User not found');window.location.href='/loginuser';</script>`);
        }
        const ismatch= await bcrypt.compare(password,user.password)
        if(!ismatch){
            return res.status(400).send(`<script>alert('Invalid password');window.location.href='/loginuser';</script>`);
        }
        res.render('userview',{username: username});
        //res.send(`<script>alert('Login successful');window.location.href='/login';</script>`);
    }catch(err){
        console.error(err)
        res.status(500).send(`<script>alert('Server error');window.location.href='/loginuser';</script>`);
    }
})
app.post('/logindriver', async (req, res) => {
    const drivername = req.body.drivername;
    const phone = (req.body.phone || '').trim();
    const busNumber = (req.body.busNumber || '').trim();
    const password = req.body.password;

    try {
        const driver = await Driver.findOne({ drivername });
        if (!driver) {
            return res.status(400).send(`<script>alert('driver not found');window.location.href='/logindriver';</script>`);
        }

        const ismatch = await bcrypt.compare(password, driver.password);
        const phoneDb = String(driver.phone);
        const busNumberDb = String(driver.busNumber);

        const ismatch2 = phone === phoneDb;
        const ismatch3 = busNumber === busNumberDb;

        if (!ismatch || !ismatch2 || !ismatch3) {
            return res.status(400).send(`<script>alert('Invalid credentials');window.location.href='/logindriver';</script>`);
        }

        res.render('driver', { drivername: drivername });
    } catch (err) {
        console.error(err);
        res.status(500).send(`<script>alert('Server error');window.location.href='/logindriver';</script>`);
    }
});


app.get('/registeruser',(req,res)=>{
    res.render('registeruser')
})
app.get('/registerdriver',(req,res)=>{
    res.render('registerdriver')
})
app.post('/registeruser', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send(`<script>alert('User already exists! Use a different username');window.location.href='/registeruser';</script>`);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();
        res.send(`<script>alert('User registered successfully'); window.location.href='/loginuser';</script>`);
    } catch (err) {
        console.log(err);
        res.status(500).send(`<script>alert('Server error'); window.location.href='/registeruser';</script>`);
    }
});
app.post('/registerdriver', async (req, res) => {
    const drivername= req.body.drivername
    const phone= req.body.phone
    const busNumber= req.body.busNumber
    const password= req.body.password
    try {
        const existingdriver = await Driver.findOne({ drivername });
        if (existingdriver) {
            return res.status(400).send(`<script>alert('driver already exists! Use a different drivername');window.location.href='/registerdriver';</script>`);
        }
        const existingPhone = await Driver.findOne({ phone });
        if (existingPhone) {
            return res.status(400).send(`<script>alert('Phone number already exists! Use a different phone number');window.location.href='/registerdriver';</script>`);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newdriver = new Driver({
            drivername,
            phone,
            busNumber,
            password: hashedPassword
        });
        await newdriver.save();
        res.send(`<script>alert('driver registered successfully'); window.location.href='/logindriver';</script>`);
    } catch (err) {
        console.log(err);
        res.status(500).send(`<script>alert('Server error'); window.location.href='/registerdriver';</script>`);
    }
});

server.listen(port,()=>{
    console.log(`App listening to port ${port}`)
})