"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const workerRoutes_1 = __importDefault(require("./routes/workerRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
exports.JWT_SECRET = "hemanth";
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/worker", workerRoutes_1.default);
app.listen(3000, () => {
    console.log("server is running");
});
