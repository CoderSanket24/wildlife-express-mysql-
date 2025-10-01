import { createVisitor, hashPassword, getVisitorByEmail, comparePasswords, generateToken, getAdminByEmail } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

export const getRegistrationPage = async (req, res) => {
    try {
        return res.render('auth/register', { error: req.flash('error') });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postRegistrationPage = async (req, res) => {
    try {
        const { data, error } = registerSchema.safeParse(req.body);
        if (error) {
            console.error('Validation error:', error.issues[0].message);
            req.flash('error', error.issues[0].message);
            return res.redirect('/register');
        }
        const { name, aadhar_id, email, age, gender, phone, address, city, pin, interests, password, confirm_password } = data;

        const visitor = await getVisitorByEmail(email);
        if (visitor) {
            req.flash('error', "Email already exists.");
            return res.redirect('/register');
        }

        if (password !== confirm_password) {
            req.flash('error', "Password and confirm password do not match.");
            return res.redirect('/register');
        }

        const hashedPassword = await hashPassword(password);

        // Handle interests array - convert to comma-separated string
        const interestsString = Array.isArray(interests) ? interests.join(',') : interests;

        const user = await createVisitor(name, aadhar_id, email, age, gender, phone, address, city, pin, interestsString, hashedPassword);
        console.log('User created successfully:', user);
        return res.redirect('/login');
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: "Internal server error. Please try again." });
    }
}

export const getLoginPage = async (req, res) => {
    try {
        return res.render('auth/login', { error: req.flash('error') });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postLoginPage = async (req, res) => {
    try {
        const { data, error } = loginSchema.safeParse(req.body);
        if (error) {
            req.flash('error', error.issues[0].message);
            return res.redirect('/login');
        }
        const { email, password, role } = data;
        let user = null;
        if (role === 'admin') {
            user = await getAdminByEmail(email);
        }else{
            user = await getVisitorByEmail(email);
        }
        if (!user) {
            req.flash('error', "Invalid email or password");
            return res.redirect('/login');
        }
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
            req.flash('error', "Invalid email or password");
            return res.redirect('/login');
        }
        const token = generateToken({ id: user.id, name: user.name, email: user.email, role: role });

        res.cookie("isLoggedIn", true);
        res.cookie("session_token", token);
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getLogout = async (req,res) => {
    try {
        res.clearCookie("session_token");
        res.clearCookie("isLoggedIn");
        return res.redirect("/");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}