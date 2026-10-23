import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your full name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email address'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false, 
        },
        targetRole: {
            type: String,
            default: 'Full Stack MERN Engineer',
            trim: true,
        },
        experienceLevel: {
            type: String,
            enum: ['Fresher / Final Year', 'Junior (1-2 yrs)', 'Mid-Level (3-5 yrs)'],
            default: 'Fresher / Final Year',
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;