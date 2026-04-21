import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  const resend = new Resend(process.env.RESEND_API_KEY);

  // API Route for notifications
  app.post("/api/notify-investigation", async (req, res) => {
    try {
      const { reportName, environment, version, recipientEmail, userEmail } = req.body;

      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not found in environment variables.");
        return res.status(500).json({ error: "Email service not configured. Please set RESEND_API_KEY in secrets." });
      }

      if (!recipientEmail) {
        return res.status(400).json({ error: "Recipient email is required." });
      }

      const { data, error } = await resend.emails.send({
        from: process.env.NOTIFICATION_EMAIL_FROM || "onboarding@resend.dev",
        to: recipientEmail,
        subject: `🚨 Investigation Required: ${reportName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 24px; color: white;">
              <h1 style="margin: 0; font-size: 24px;">Investigation Needed</h1>
            </div>
            <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
              <p>A report has been flagged for investigation by <strong>${userEmail || 'a user'}</strong>.</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Report:</strong> ${reportName}</p>
                <p style="margin: 0 0 8px 0;"><strong>Environment:</strong> ${environment}</p>
                <p style="margin: 0 0 8px 0;"><strong>Version:</strong> ${version || 'N/A'}</p>
              </div>
              
              <p>Please log in to the LivingDoc Explorer to review the details and resolve the issue.</p>
              
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              
              <p style="font-size: 12px; color: #64748b; margin: 0;"> This is an automated notification from the LivingDoc Explorer app. </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(400).json(error);
      }

      res.status(200).json(data);
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
