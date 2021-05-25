const express = require("express");
const bodyParser = require("body-parser");

const { Client } = require("pg");

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Dhanush@04",
    database: "dbms_project"
})

const app= express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
    res.render("index",{flag:1});
});

app.post("/",function(req,res){
    var but = req.body.submitform;
    var result="";

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
            res.render("index",{flag:2,use_name: result});
            client.end();
        })();
    }
    else{
        (async () => {
            await client.connect();
            const resu = await client.query('SELECT UNAME FROM USERS WHERE EMAIL=$1 AND UPASSWORD=$2',[uemail,upass]);
            result=resu.rows[0].uname;
            console.log(result);
            res.render("index",{flag:2,use_name: result});
            client.end();
        })();
    }
    
    
})

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000);