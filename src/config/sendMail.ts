import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.RESEND_API_KEY){
    throw new Error("RESEND_API_KEY is not defined in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY!);

const sendMail = async (toSend: string, subject: string, html: string) => {
    try {
        const response = await resend.emails.send({
            from: "Pavan <onboarding@resend.dev>",
            to: toSend,
            subject: subject,
            html: html,
        });
        console.log("Email sent successfully:", response);

        return response;
    } catch (error) {
        console.error("Error sending email:", error);

        throw error;
    }
};

export default sendMail;
