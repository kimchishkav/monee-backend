import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { accountsRouter } from "./modules/accounts/accounts.routes";
import { transactionsRouter } from "./modules/transactions/transactions.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { statisticsRouter } from "./modules/statistics/statistics.routes";
import { profileRouter } from "./modules/profile/profile.routes";
import { currencyRouter } from "./modules/currency/currency.routes";

export const app = express();

const isLocalhostOrigin = (origin: string) => /^http:\/\/localhost:\d+$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser requests (curl, server-to-server) send no Origin header — allow them.
      if (!origin) return callback(null, true);

      // In dev, accept any localhost port so a busy default Vite port doesn't break CORS.
      if (env.nodeEnv !== "production" && isLocalhostOrigin(origin)) {
        return callback(null, true);
      }

      if (env.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  }),
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/currency", currencyRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
