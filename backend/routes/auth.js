import express from "express";
import zod from "zod";
import {PrismaClient} from "@prisma/client";
import jwt from "jsonwebtoken"
import c from "crypto";


const router = express.Router();

let signup_schema = zod.object({
    email: zod.string().email(),
    password: zod.string(),
    firstname: zod.string(),
    lastname: zod.string()
})

let prisma = new PrismaClient({datasourceUrl: process.env.DATABASE_URL});

router.post('/signup', async (req, res)=>{
    const body = req.body;
    let rv = signup_schema.safeParse(body);
    if (!rv.success){
        return res.status(400).json({message: "Invalid input given"});
    }

    let usr = await prisma.user.findUnique({where: {email: body.email}});
    if(usr){
        return res.status(401).json({message: "Username already takenup..."});
    }

    let salt = c.randomBytes(16).toString('hex');
    let hashed_pwd = c.pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString('hex');

    usr = await prisma.user.create({data: {email: body.email, 
                               password: hashed_pwd,
                               salt: salt,
                               firstname: body.firstname,
                               lastname: body.lastname}});
    
    const token = jwt.sign({id: usr.id, email: usr.email, isAdmin: false}, process.env.JWT_SECRET);

    res.status(201).json({message: "User created", token: token});
});

//Signin route

let signin_schema = zod.object({
    email: zod.string().email(),
    password: zod.string()
});

router.post('/signin', async (req, res)=>{
    const body = req.body;
    let rv = signin_schema.safeParse(body);
    if(!rv.success){
        return res.status(401).json({message: "Invalid Inputs provided."});
    }

    let usr = await prisma.user.findUnique({where: {email: body.email}});
    if(!usr){
        return res.status(401).json({message: "Username or Password Invalid."});
    }

    //console.log(usr);
    let salt = usr.salt;
    let password_hash_db = usr.password;
    let password_hash_usr = c.pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString('hex');

    if(password_hash_db !== password_hash_usr){
        return res.status(401).json({message: "Username or Password Invalid."});
    }

    const token = jwt.sign({id: usr.id, email: usr.email, isAdmin: usr.isAdmin}, process.env.JWT_SECRET);
    return res.status(201).json({message: "Signin success", token: token});

})


export {router};
