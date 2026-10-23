import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, targetRole, experienceLevel } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
        }

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            targetRole: targetRole || 'Full Stack MERN Engineer',
            experienceLevel: experienceLevel || 'Fresher / Final Year',
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                targetRole: user.targetRole,
                experienceLevel: user.experienceLevel,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Logged in successfully!',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                targetRole: user.targetRole,
                experienceLevel: user.experienceLevel,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

export const getUserProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
};