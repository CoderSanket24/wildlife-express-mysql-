import z from "zod";

export const loginSchema = z.object({
    email: z.email({error:"Invalid email format."}),
    password: z.string().trim().min(6,{error:"Password must be at least 6 characters."}).max(100,{error:"Password must not more than 100 characters."}),
    role: z.string(),
})

export const registerSchema = z.object({
    name: z.string().trim().min(3,{error:"Name must be at least 3 characters."}).max(100,{error:"Name must not more than 100 characters."}),
    aadhar_id: z.string().trim().min(12,{error:"Aadhar ID must be at least 12 characters."}).max(12,{error:"Aadhar ID must not more than 12 characters."}),
    age: z.coerce.number().int().min(1,{error:"Age must be at least 1."}).max(100,{error:"Age must not more than 100."}),
    gender: z.string().trim().min(1,{error:"Gender is required."}),
    phone: z.string().trim().min(10,{error:"Phone number must be at least 10 characters."}).max(10,{error:"Phone number must not more than 10 characters."}),
    address: z.string().trim().min(1,{error:"Address is required."}),
    city: z.string().trim().min(1,{error:"City is required."}),
    pin: z.string().trim().min(6,{error:"PIN must be at least 6 characters."}).max(6,{error:"PIN must not more than 6 characters."}),
    interests: z.preprocess(
        (val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : []),
        z.array(z.string()).min(1,{error:"At least one interest is required."})
    ),
    confirm_password: z.string().trim().min(6,{error:"Confirm password must be at least 6 characters."}).max(100,{error:"Confirm password must not more than 100 characters."}),
    email: z.email({error:"Invalid email format."}),
    password: z.string().trim().min(6,{error:"Password must be at least 6 characters."}).max(100,{error:"Password must not more than 100 characters."}),
});