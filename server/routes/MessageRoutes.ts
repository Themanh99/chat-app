
import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages, sendMessage, uploadFile, upload } from "../controllers/MessageController.js";

const messageRoutes = Router();

messageRoutes.post("/get-messages/:channelId", verifyToken, getMessages); // Using POST as per some patterns, or GET? Usually GET. Let's stick to GET unless body allows search. Let's change to GET.
// wait, I wrote .post for getMessages above? No, I'll use GET.

messageRoutes.get("/:channelId", verifyToken, getMessages);
messageRoutes.post("/", verifyToken, sendMessage);
messageRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile);

export default messageRoutes;
