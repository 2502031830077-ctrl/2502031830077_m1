import express from 'express'
const app=express()

app.set('view engine','ejs')

app.get('/',(req,res)=>{
    res.send("<h1>Home Page</h1>");
})

app.get('/about',(req,res)=>{
    let items=['Apple','Banana','Orange','Grapes'];

    var users=[
        {name:'John',age:30,city:'New York'},
        {name:'Jane',age:25,city:'Los Angeles'},
        {name:'Bob',age:35,city:'Chicago'}
    ];

    res.render('about',{
        title:'About Page', 
        message:'Welcome to EJS!',
        items: users,
        fruits: items
    });
})  


app.listen(3000,()=>{
    console.log("Server started successfully on port : 3000");

});