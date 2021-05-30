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
            await client.connect();
            await client.query('INSERT INTO USERS(UNAME,EMAIL,UPASSWORD) VALUES ($1,$2,$3)',[uname,uemail,upass]);
            const resu = await client.query('SELECT UNAME FROM USERS WHERE EMAIL=$1 AND UPASSWORD=$2',[uemail,upass]);
            result=resu.rows[0].uname;
            console.log(result);
            res.render("index",{flag:f,use_name: result});
            client.end();
        })();
    }
    else{
        (async () => {
            await client.connect();
            const resu = await client.query('SELECT UNAME FROM USERS WHERE EMAIL=$1 AND UPASSWORD=$2',[uemail,upass]);
            result=resu.rows[0].uname;
            console.log(result);
            res.render("index",{flag:f,use_name: result});
            client.end();
        })();
    }
    
    
})

app.get("/about",function(req,res){
    res.render("about");
});
app.get("/dietplan",function(req,res){
    res.render("dietplan",{flag:f,use_name: result,i:1});
});
app.get("/user",function(req,res){
    res.render("user",{flag:f,use_name: result});
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
    res.render("dietplan",{flag:f,use_name: result,i:2,bfarr:bf,lunarr:lun,dinarr:din});
})
app.get("/dietplan/diet", (res,req)=>{

    return 2;
})
app.listen(3000);