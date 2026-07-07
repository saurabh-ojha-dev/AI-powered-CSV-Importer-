import rateLimit from "express-rate-limit";

/**
 * Basic in-memory rate limiter.
 * 10 requests per minute per IP — prevents abuse of the LLM-backed endpoint.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please try again in a minute" },
});
