import jwt from "jsonwebtoken";

export function auth_middleware(req, res, next){
    const auth_header = req.headers.authorization;
    if (!auth_header || !auth_header.startsWith('Bearer ')){
        return res.status(401).json({message: "Unauthorized."});
    }

    const token = auth_header.split(' ')[1];

    try{
        const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.email = token_decoded.email;
        req.isAdmin = token_decoded.isAdmin;
        req.id = token_decoded.id;
        next();
    }
    catch(err){
        res.status(401).json({message:"Unauthorized."});
    }
}