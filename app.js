const express = require("express");
const bodyParser = require("body-parser");

const { Pool } = require("pg");

const client = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "11babli22",
    database: "dbms_project"
})



const app= express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var f=1;
app.get("/",function(req,res){

    res.render("index",{flag:f});
});

var result="";
var bresult="";
app.post("/",function(req,res){
    f=2;
    var but = req.body.submitform;

    let uemail= req.body.user_email;
    let upass = req.body.user_password;
    console.log("hello");
    console.log(but);
    if(but==1){
        (async () => {
            let uname = req.body.user_name;
            let ugenger = req.body.gender;
            let uheight = req.body.user_height;
            let uweight = req.body.user_weight;
            await client.connect();
            await client.query('INSERT INTO USERS(UNAME,EMAIL,UPASSWORD,GENDER,WEIGHT,HEIGHT) VALUES ($1,$2,$3,$4,$5,$6)',[uname,uemail,upass,ugenger,uweight,uheight]);
            var resu = await client.query('SELECT * FROM USERS WHERE EMAIL=$1 AND UPASSWORD=$2',[uemail,upass]);
            result=resu.rows[0];
            resu = await client.query('SELECT * FROM bmi WHERE email=$1',[uemail]);
            
            bresult = resu.rows[0];
            console.log(bresult);
            console.log(result);
            res.render("index",{flag:f,use_name: result.uname});
        })();
    }
    else{
        (async () => {
            await client.connect();
            var resu = await client.query('SELECT * FROM USERS WHERE EMAIL=$1 AND UPASSWORD=$2',[uemail,upass]);
            result=resu.rows[0];
            resu = await client.query('SELECT * FROM bmi WHERE email=$1',[uemail]);
            bresult = resu.rows[0];
            console.log(bresult);
            
            console.log(result);
            res.render("index",{flag:f,use_name: result.uname});
        })();
    }
    
    
})

app.get("/about",function(req,res){
    res.render("about");
});
app.get("/dietplan",function(req,res){
    res.render("dietplan",{flag:f,use_name: result.uname,i:1});
});
app.get("/user",async(req,res)=>{
    if(result.gender == 'M')
        var g='Male';
    else
        var g='Female';
    await client.connect();    
    console.log(result.email);
    var resu = await client.query('select * from bmi where email=$1',[result.email]);
    console.log(resu.rows);
    var ress = await client.query('select uname from users where email in (select remail from connections where semail=$1)',[result.email]);
    res.render("user",{flag:f,use_name: result.uname,gen:g,b:bresult.bmi,wei:bresult.weight,hei:bresult.height,bmihis:resu.rows,myconnect:ress.rows,p:1});
    // res.render("user");
});
app.post("/dietplan",async(req,res)=>{
    var cal = req.body.calories;
    let bf=[];
    var lun=[];
    var din=[];
    
    ucal = cal/3+30;
    dcal = cal/3-30;
    console.log(cal);

    await client.connect();
    console.log("yes");
    var b = await client.query("select * from products where etime=$1 and calories >$2 and calories <$3",['B',dcal,ucal]);
    for(var i=0;i<b.rowCount;i++){
        console.log(i);
        var temp={foods:b.rows[i].food,quant:b.rows[i].quantity,cal:b.rows[i].calories};
        bf.push(temp);
    }
    b = await client.query("select * from products where etime=$1 and calories >$2 and calories <$3",['L',dcal,ucal]);
    for(var i=0;i<b.rowCount;i++){
        console.log(i);
        var temp={foods:b.rows[i].food,quant:b.rows[i].quantity,cal:b.rows[i].calories};
        lun.push(temp);
    }
    b = await client.query("select * from products where etime=$1 and calories >$2 and calories <$3",['D',dcal,ucal]);
    for(var i=0;i<b.rowCount;i++){
        console.log(i);
        var temp={foods:b.rows[i].food,quant:b.rows[i].quantity,cal:b.rows[i].calories};
        din.push(temp);
    }
    

    console.log(bf[0].foods);
    res.render("dietplan",{flag:f,use_name: result.uname,i:2,bfarr:bf,lunarr:lun,dinarr:din});
});
app.get('/users',async(req,res)=>{
    const searchField=req.query.x;
    try{
        await client.connect();
        var resu=await client.query("select uname,email from users where email != $1 and uname like $2 || '%' and email not in (select remail from connections where semail=$3 )",[result.email,searchField,result.email]);
        console.log(resu.rows);
        return res.status(200).send({message:"Fetch successful",data:resu.rows});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Fetch unsuccessful"});
    }
});

app.post('/user',async(req,res)=>{
    var a = req.body.weig;
    var b = req.body.heig;
    c=b/a;
    await client.connect();
    await client.query('insert into bmi(email,weight,height,bmi,gender) values($1,$2,$3,$4,$5)',[result.email,a,b,c,result.gender]);
    var resu = await client.query('select * from bmi where email=$1',[result.email]);
    res.render("user",{flag:f,use_name: result.uname,gen:result.gender,b:c,wei:a,hei:b,bmihis:resu,myconnect:ress.rows,p:1});
})

app.get('/use',async(req,res)=>{
    const addfriend = req.query.y;
    console.log(addfriend);
    try{
        await client.connect();
        var ress = await client.query('select email from users where uname =$1',[addfriend]);
        var resu=await client.query('insert into connections values($1,$2,$3)',[result.email,ress.rows[0].email,'1']);
        console.log(ress.rows[0].email);
        return res.status(200).send({message:"Fetch successful",data:resu.rows});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Fetch unsuccessful"});
    }
})

app.get('/us',async(req,res)=>{
    const addfriend = req.query.z;
    console.log(addfriend);
    try{
        await client.connect();
        var ress = await client.query('select * from users where uname =$1',[addfriend]);
        console.log(ress.rows[0].email);
        c= ress.rows[0].height/ress.rows[0].weight;
        return res.status(200).send({message:"Fetch successful",data:ress.rows});
    }
    catch(err){
        console.log(err.message);
        return res.status(400).send({message:"Fetch unsuccessful"});
    }
})

app.listen(3000);