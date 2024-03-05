import express from "express";
import cors from "cors";
import {router as auth_router} from "./routes/auth.js";
import {router as adtyp_router} from "./routes/adtypes.js";
import {router as ads_router} from "./routes/advertisements.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', auth_router);
app.use('/api/v1/adtyp', adtyp_router);
app.use('/api/v1/ads', ads_router);

app.listen(3000, ()=>{console.log('Server listening on port 3000')});