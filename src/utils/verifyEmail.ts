import axios from "axios";

export const verifyEmail = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.get(`https://api.zerobounce.net/v2/validate?api_key=${process.env.ZeroBounce_API_Key}&email=${email}`);
    return response.data.status === "valid";
  } catch (error) {
    console.error("Error verifying email:", error);
    return false;
  }
};