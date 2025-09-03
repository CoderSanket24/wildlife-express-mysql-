export const getRegistrationPage = async (req,res) => {
    try {
        return res.render('auth/register');
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}