import express from "express";
import zod from "zod";
import { auth_middleware } from "./auth_middleware.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient({datasourceUrl: process.env.DATABASE_URL});

let adType_schema = zod.object({
    type: zod.string(),
});

router.post('/create-adType', auth_middleware, async (req, res)=>{
    if (!req.isAdmin){
        return res.status(401).json({message:"Unauthorized."});
    }

    const body = req.body;
    let rv = adType_schema.safeParse(body);
    if(! rv.success){
        return res.status(401).json({message: "Invalid Input given."});
    }

    let adt = await prisma.adType.create({
        data: {type: body.type}
    });

    return res.status(201).json({message: "AdType created"});
});

router.post('/update-adType/:id', auth_middleware, async (req, res)=>{
    if (!req.isAdmin){
        return res.status(401).json({message:"Unauthorized."});
    }

    const body = req.body;
    let rv = adType_schema.safeParse(body);
    if(! rv.success){
        return res.status(401).json({message: "Invalid Input given."});
    }

    const id = req.params.id;
    let adt = await prisma.adType.update({
        data: {type: body.type},
        where: {id: id}
    });

    return res.status(201).json({message: "AdType updated"});
});

router.delete('/delete-adType/:id', auth_middleware, async (req, res)=>{
    if (!req.isAdmin){
        return res.status(401).json({message:"Unauthorized."});
    }

    const id = req.params.id;
    let adt = await prisma.adType.delete({
        where: {id: id}
    });

    return res.status(201).json({message: "AdType deleted"});
});

router.get('/get-adType', auth_middleware, async (req, res)=>{
    let adtypes = await prisma.adType.findMany();
    return res.status(201).json({message: "AdType fetched", data: adtypes});
});

export {router};