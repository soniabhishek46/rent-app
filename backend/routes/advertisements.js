import express from "express";
import zod from "zod";
import { auth_middleware } from "./auth_middleware.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient({datasourceUrl: process.env.DATABASE_URL});

let ads_schema = zod.object({
    adTypeId: zod.number(),
    heading: zod.string(),
    description: zod.string(),
    price: zod.number()
});

router.post('/create-ad', auth_middleware, async (req, res)=>{

    const body = req.body;
    let rv = ads_schema.safeParse(body);
    if(! rv.success){
        return res.status(401).json({message: "Invalid Input given."});
    }

    let adt = await prisma.advertisement.create({
        data: {
            userid: req.id,
            adTypeId: body.adTypeId,
            heading: body.heading,
            description: body.description,
            price: body.price
        }
    });

    return res.status(201).json({message: "Ad created"});
});

router.post('/update-ad/:id', auth_middleware, async (req, res)=>{

    const body = req.body;
    let rv = ads_schema.safeParse(body);
    if(! rv.success){
        return res.status(401).json({message: "Invalid Input given."});
    }

    const id = req.params.id;
     
    let ads = await prisma.adType.update({
        data: {
            adTypeId: body.adTypeId,
            heading: body.heading,
            description: body.description,
            price: body.price
        },
        where: { AND: [{id: id}, {userid: req.id}]}
    });

    return res.status(201).json({message: "Ad updated"});
});

router.delete('/delete-ad/:id', auth_middleware, async (req, res)=>{

    const id = req.params.id;
    let adt = await prisma.adType.delete({
        where: { AND: [{id: id}, {userid: req.id}]}
    });

    return res.status(201).json({message: "Ad deleted"});
});

router.get('/get-ad', auth_middleware, async (req, res)=>{
    let ads = await prisma.advertisement.findMany();
    return res.status(201).json({message: "Ads fetched", data: adtypes});
});

export {router};