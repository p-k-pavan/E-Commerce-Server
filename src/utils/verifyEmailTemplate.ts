const verifyEmailTemplate = ({ name, otp }: { name: string; otp: string }) => {
  return `
    <p>Dear ${name},</p>    
    <p>Your OTP for password reset is:</p>   
    <h2 style="color:orange;">${otp}</h2>
    <p>This OTP will expire in 10 minutes.</p>
  `;
};

export default verifyEmailTemplate;
