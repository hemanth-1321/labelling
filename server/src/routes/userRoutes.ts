import { response, Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "..";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "../middleware";
import { createTask } from "../types";
const prisma = new PrismaClient();
const router = Router();

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESSKEY ?? "",
    secretAccessKey: process.env.SECRETACCESSKEY ?? "",
  },
});

router.get("/presigned-url", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const command = new PutObjectCommand({
    Bucket: "hemanth.buzz.label",
    Key: `label/${userId}/image`,
  });

  const presignedUrl = await getSignedUrl(s3Client, command);
  console.log(presignedUrl);
  res.status(200).json(presignedUrl);
});

router.post("/signin", async (req, res) => {
  const hardcodedWalletAddress = "Dm9G9xHUTCMKQNrkwMYVLagNZiHMykHLXWRhaAMUPSQa";

  const user = await prisma.user.findFirst({
    where: {
      address: hardcodedWalletAddress,
    },
  });
  if (user) {
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );
    res.json({
      token,
    });
  } else {
    const newUser = await prisma.user.create({
      data: {
        address: hardcodedWalletAddress,
      },
    });
    const token = jwt.sign(
      {
        userId: newUser.id,
      },
      JWT_SECRET
    );
    res.json({
      token,
    });
  }
});
router.post("/task", authMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const user_id = req.userId;
    const body = req.body;
    console.log("Incoming body:", body);

    const parsedata = createTask.safeParse(body);
    if (!parsedata.success) {
      res.status(411).json({
        message: "You sent wrong inputs",
      });
      return;
    }

    const response = await prisma.$transaction(async (tx) => {
      const createdTask = await tx.task.create({
        data: {
          title: parsedata.data.title || "",
          signature: "signature",
          amount: "1",
          user_id,
        },
      });

      const optionsData =
        parsedata.data.options?.map((x) => ({
          image_url: x.image_url,
          task_id: createdTask.id,
        })) ?? [];

      console.log("Options to create:", optionsData);

      if (optionsData.length > 0) {
        await tx.options.createMany({
          data: optionsData,
        });
      }

      return createdTask;
    });

    res.status(201).json({
      id: response.id,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      message: "Something went wrong while creating the task.",
    });
    return;
  }
});

export default router;
