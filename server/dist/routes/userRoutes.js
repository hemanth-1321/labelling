"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const __1 = require("..");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const s3Client = new client_s3_1.S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: (_a = process.env.ACCESSKEY) !== null && _a !== void 0 ? _a : "",
        secretAccessKey: (_b = process.env.SECRETACCESSKEY) !== null && _b !== void 0 ? _b : "",
    },
});
router.get("/presigned-url", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: "hemanth.buzz.label",
        Key: `label/${userId}/image`,
    });
    const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command);
    console.log(presignedUrl);
    res.status(200).json(presignedUrl);
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hardcodedWalletAddress = "Dm9G9xHUTCMKQNrkwMYVLagNZiHMykHLXWRhaAMUPSQa";
    const user = yield prisma.user.findFirst({
        where: {
            address: hardcodedWalletAddress,
        },
    });
    if (user) {
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, __1.JWT_SECRET);
        res.json({
            token,
        });
    }
    else {
        const newUser = yield prisma.user.create({
            data: {
                address: hardcodedWalletAddress,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: newUser.id,
        }, __1.JWT_SECRET);
        res.json({
            token,
        });
    }
}));
router.post("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const user_id = req.userId;
        const body = req.body;
        console.log("Incoming body:", body);
        const parsedata = types_1.createTask.safeParse(body);
        if (!parsedata.success) {
            res.status(411).json({
                message: "You sent wrong inputs",
            });
            return;
        }
        const response = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const createdTask = yield tx.task.create({
                data: {
                    title: parsedata.data.title || "",
                    signature: "signature",
                    amount: "1",
                    user_id,
                },
            });
            const optionsData = (_b = (_a = parsedata.data.options) === null || _a === void 0 ? void 0 : _a.map((x) => ({
                image_url: x.image_url,
                task_id: createdTask.id,
            }))) !== null && _b !== void 0 ? _b : [];
            console.log("Options to create:", optionsData);
            if (optionsData.length > 0) {
                yield tx.options.createMany({
                    data: optionsData,
                });
            }
            return createdTask;
        }));
        res.status(201).json({
            id: response.id,
        });
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({
            message: "Something went wrong while creating the task.",
        });
        return;
    }
}));
exports.default = router;
