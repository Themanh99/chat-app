
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { z } from "zod";
import { env } from "../config/env.js";
import User from "../models/UserModel.js";
import { generateTokens, setCookies } from "../helpers/AuthHelper.js";
import { AppError } from "../utils/AppError.js";
import { HttpCodes } from "../constants/http-codes.js";
import { ErrorCodes } from "../constants/error-codes.js";

export const initiateSSO = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { companyCode } = req.query; 

        // In a real multi-tenant app, companyCode might determine the IdP configuration.
        // For this task, we use the single OneLogin configuration from env.
        
        const params = new URLSearchParams({
            client_id: env.ONELOGIN_CLIENT_ID,
            redirect_uri: env.ONELOGIN_REDIRECT_URI,
            response_type: "code",
            scope: "openid profile email",
            state: "random_state_string", // Should be securely generated in prod
        });

        const authUrl = `${env.ONELOGIN_ISSUER_URL}/auth?${params.toString()}`;
        
        return res.json({ redirectUrl: authUrl });
    } catch(err) {
        next(err);
    }
}

export const handleSSOCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.query;
        if(!code || typeof code !== 'string') {
             throw new AppError("Authorization code missing", HttpCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
        }

        // Exchange code for tokens
        const tokenResponse = await axios.post(`${env.ONELOGIN_ISSUER_URL}/token`, new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: env.ONELOGIN_CLIENT_ID,
            client_secret: env.ONELOGIN_CLIENT_SECRET,
            redirect_uri: env.ONELOGIN_REDIRECT_URI
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const { id_token, access_token } = tokenResponse.data;
        
        // Get User Info
        const userInfoResponse = await axios.get(`${env.ONELOGIN_ISSUER_URL}/me`, {
             headers: { Authorization: `Bearer ${access_token}` }
        });
        
        const userEmail = userInfoResponse.data.email || userInfoResponse.data.preferred_username;
        
        if(!userEmail) throw new AppError("Email not found in SSO profile", HttpCodes.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR);

        // Find or Create User
        let user = await User.findOne({ email: userEmail });
        if(!user) {
             // Create new user (Generate random password as it's SSO managed)
             const randomPass = Math.random().toString(36).slice(-8) + "Aa1!";
             user = await User.create({ 
                 email: userEmail, 
                 pass: randomPass,
                 firstName: userInfoResponse.data.given_name || "",
                 lastName: userInfoResponse.data.family_name || ""
             });
        }

        // Generate App Tokens
        const { accessToken: appAccessToken, refreshToken: appRefreshToken } = await generateTokens(user.id, user.email);
        setCookies(res, appAccessToken, appRefreshToken);

        // Redirect to success page on FE
        // Using ORIGIN from env to support dev/prod
        res.redirect(`${env.ORIGIN}/auth/success?token=${appAccessToken}`); 

    } catch(err) {
        console.error("SSO Error:", err);
        // Redirect to login with error
        res.redirect(`${env.ORIGIN}/auth?error=sso_failed`);
    }
}
