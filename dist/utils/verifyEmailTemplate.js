"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyEmailTemplate = ({ name, otp }) => {
    return `
    <p>Dear ${name},</p>    
    <p>Your OTP for password reset is:</p>   
    <h2 style="color:orange;">${otp}</h2>
    <p>This OTP will expire in 10 minutes.</p>
  `;
};
exports.default = verifyEmailTemplate;
