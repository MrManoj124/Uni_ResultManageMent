import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try{
        //Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer','');

        if(!token){
            return res.status(401).json({
                success:false,
                message:'Access denied. No token provided.'
            });
        }

        //Verify token 
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    }catch(error){
        if(error.name === 'ToeknExpiredError'){
            return res.status(401).json({
                success:false,
                message:'Token expired. Please Login Again.'
            });
        }
        return res.status(400).json({
            success:false,
            message:'Invalid Token.'
        });
    }
};

//Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRE || '7d'}
    );
};

