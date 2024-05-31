const express = require('express');
require('./mongodb/config');
const cors = require('cors');
const User = require('./mongodb/userSchema')
const Product = require('./mongodb/productSchema')
const jwt = require('jsonwebtoken');

const JwtKey = "jwt-e-comm"

const app = express()
const port = 5000;

app.use(express.json())
app.use(cors())

app.post('/register', async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    jwt.sign({result}, JwtKey, {expiresIn: "1000h"}, (err, token) => {
        if(err) {
            res.send({result: "Something went wrong"})
        } 
        res.send({result, auth: token})
    })
});

app.post('/login', async (req, res) => {
    if(req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select('-password')
        if(user) {
            jwt.sign({user}, JwtKey, {expiresIn: "1000h"}, (err, token) => {
                if(err) {
                    res.send({result: "Something went wrong"})
                } 
                res.send({user, auth: token})
            })
        } else {
            res.send({result: "No User Found"})
        }
    } else {
        res.send({result: "No User Found"})
    }
})


app.post('/add-product', async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result);
})

app.get('/products', async (req, res) => {
    let products = await Product.find();
    if(products.length > 0 ) {
        res.send(products)
    } else (
        console.log({result: "No Data Found"})
    )
})


app.delete('/product/:id', async (req, res) => {
    let deleteProd = await Product.deleteOne({id: req.params._id});
    res.send(deleteProd)
})


app.get('/product/:id', async (req, res) => {
    let updateProd = await Product.findOne({_id: req.params.id})
    if(updateProd) {
        res.send(updateProd)
    } else {
        res.send({result: "Error occur in API"})
    }
})


app.put('/product/:id', async (req, res) => {
    let updateProdData = await Product.updateOne({_id: req.params.id}, {$set: req.body});
    res.send(updateProdData)
})

app.listen(port)