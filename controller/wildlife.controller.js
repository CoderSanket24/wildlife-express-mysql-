import path from "path";

export const getHomePage = async (req,res)=>{
    try {
        return res.sendFile(path.join(import.meta.dirname,'../index.html'));
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}