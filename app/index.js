const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ================= UTILITY FUNCTIONS =================

// Fibonacci
function getFibonacci(n) {
  const result = [0];
  if (n === 0) return result;
  result.push(1);
  for (let i = 2; i <= n; i++) {
    result.push(result[i - 1] + result[i - 2]);
  }
  return result;
}

// Prime
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// GCD
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// HCF
function getHCF(arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

// LCM
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function getLCM(arr) {
  return arr.reduce((acc, val) => lcm(acc, val));
}

// ================= HEALTH ROUTE =================

app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: "kritika1878.be23@chitkara.edu.in"
  });
});

// ================= MAIN ROUTE =================

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key required"
      });
    }

    const key = Object.keys(body)[0];
    const value = body[key];
    let result;

    if (key === "fibonacci") {
      if (typeof value !== "number" || value < 0)
        return res.status(400).json({ is_success: false, error: "Invalid input" });

      result = getFibonacci(value);
    }

    else if (key === "prime") {
      if (!Array.isArray(value))
        return res.status(400).json({ is_success: false, error: "Invalid input" });

      result = value.filter(isPrime);
    }

    else if (key === "hcf") {
      if (!Array.isArray(value))
        return res.status(400).json({ is_success: false, error: "Invalid input" });

      result = getHCF(value);
    }

    else if (key === "lcm") {
      if (!Array.isArray(value))
        return res.status(400).json({ is_success: false, error: "Invalid input" });

      result = getLCM(value);
    }

    // ===== AI (OpenRouter) =====
    else if (key === "AI") {
      if (typeof value !== "string")
        return res.status(400).json({ is_success: false, error: "Invalid input" });

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "user", content: value }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      result = response.data.choices[0].message.content.trim();
    }

    else {
      return res.status(400).json({
        is_success: false,
        error: "Invalid key"
      });
    }

    return res.status(200).json({
      is_success: true,
      official_email: "kritika1878.be23@chitkara.edu.in",
      data: result
    });

  } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      is_success: false,
      error: "Internal server error"
    });
  }
});


module.exports = app;
