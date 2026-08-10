import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  // const authHeader = req.headers.authorization;
  // const token = authHeader.split(" ")[1];
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    if(!token) {
      res.status(401).json({ message: "No authentication token, access denied"});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    const user = await User.findByPk(decoded.userId, {
      attributes: {
        exclude: ["password"]
      }
    });

    if(!user) return res.status(404).json({ message: "Token not valid" });

    req.user = user;

    next();    
  } catch (error) {
    console.log("Authentication error", error);
    return res.status(401).json({ message: "Unauthorized Access"});
  }

}

export default protectRoute;