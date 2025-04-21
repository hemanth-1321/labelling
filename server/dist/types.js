"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = void 0;
const zod_1 = require("zod");
exports.createTask = zod_1.z.object({
    options: zod_1.z
        .array(zod_1.z.object({
        image_url: zod_1.z.string(),
    }))
        .optional(),
    title: zod_1.z.string().optional(),
    signature: zod_1.z.string(),
});
