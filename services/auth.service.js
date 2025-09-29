import { db as dbClient} from "../config/db-client.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const createVisitor = async (name, aadhar_id, email, age, gender, phone, address, city, pin, interests, password)=>{
    const [result] = await dbClient.execute(
        'INSERT INTO visitors_info (name, aadhar_id, email, age, gender, phone, address, city, pin, interests, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, aadhar_id, email, age, gender, phone, address, city, pin, interests, password]
    );
    return result.insertId;
}

export const getVisitorByEmail = async (email) => {
    const [user] = await dbClient.execute('select * from visitors where email = ?',[email]);
    return user[0];
};

export const getAdminByEmail = async (email) => {
    const [admin] = await dbClient.execute('select * from admin_details where email = ?',[email]);
    return admin[0];
};


export const hashPassword = async (password) => {
    return await argon2.hash(password);
};

export const comparePasswords = async (password, hash)=>{
    return await argon2.verify(hash,password);
}

export const generateToken = ({id, name, email,role}) => {
    return jwt.sign({id, name, email,role},process.env.SECREATE_KEY,{
        expiresIn:"1d"
    });
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECREATE_KEY);
}