import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { visitorsInfo } from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const createVisitor = async (name, aadhar_id, email, age, gender, phone, address, city, pin, interests, password)=>{
    return await db.insert(visitorsInfo).values({name, aadhar_id, email, age, gender, phone, address, city, pin, interests, password}).$returningId();
}

export const getVisitorByEmail = async (email) => {
    const [user] = await db.select().from(visitorsInfo).where(eq(visitorsInfo.email,email));
    return user;
};

export const hashPassword = async (password) => {
    return await argon2.hash(password);
};

export const comparePasswords = async (password, hash)=>{
    return await argon2.verify(hash,password);
}

export const generateToken = ({id, name, email}) => {
    return jwt.sign({id, name, email},process.env.SECREATE_KEY,{
        expiresIn:"1d"
    });
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECREATE_KEY);
}