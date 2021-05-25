const { Client } = require("pg");

const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "Dhanush@04",
    database: "dbms_project"
})

client.connect();

client.query("select * from products",(err,result)=>{
    if(!err){
        console.log(result.rows);
    }
    client.end();
})