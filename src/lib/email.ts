import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "AI-Powered PM Course <onboarding@resend.dev>";

export async function sendWelcomeEmail(studentName: string, studentEmail: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: studentEmail,
      subject: `Welcome to AI-Powered Project Management, ${studentName}! 🎓`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">Welcome to the Course! 🎓</h1>
            </div>
            <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">Hi ${studentName},</p>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
              Welcome to <strong>AI-Powered Project Management</strong>! You're now enrolled and ready to start learning.
            </p>
            <div style="background-color: #eef2ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="margin: 0; font-size: 14px; color: #4338ca;"><strong>Here's what you'll learn:</strong></p>
              <ul style="margin: 10px 0 0 20px; padding: 0; color: #475569; font-size: 14px; line-height: 1.8;">
                <li>How to use AI for project charters, WBS, and risk registers</li>
                <li>Generate status reports, meeting notes, and stakeholder communications</li>
                <li>Build reusable prompt templates and workflows</li>
                <li>Recognize when AI adds value vs. when human judgement is essential</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://ai-pm-course-liart.vercel.app"}"
                 style="background-color: #4f46e5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Start Learning →
              </a>
            </div>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
              The course has 18 modules across 5 parts. Each module includes a quiz — score 70% or higher to mark it complete. Complete all 18 modules to earn your certificate!
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              You're receiving this email because you enrolled in the AI-Powered Project Management course.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[sendWelcomeEmail] error:", error);
    }
    return data;
  } catch (e) {
    console.error("[sendWelcomeEmail] exception:", e);
  }
}

export async function sendCompletionEmail(studentName: string, studentEmail: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: studentEmail,
      subject: `🎉 Congratulations! You've completed the course, ${studentName}!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
              <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">Congratulations, ${studentName}! 🎉</h1>
            </div>
            <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
              You've successfully completed all 18 modules of the <strong>AI-Powered Project Management</strong> course!
            </p>
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #047857; font-weight: 600;">
                Your certificate of completion is ready! 🎓
              </p>
            </div>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">
              Here's what you can do now:
            </p>
            <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin: 10px 0 20px 20px;">
              <li>Download your certificate from the course dashboard</li>
              <li>Add it to your LinkedIn profile</li>
              <li>Share your achievement with your network</li>
              <li>Start applying what you learned to your projects</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://ai-pm-course-liart.vercel.app"}"
                 style="background-color: #4f46e5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View Your Certificate →
              </a>
            </div>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
              Remember the One Rule: <strong>AI drafts. You decide.</strong> Go build something amazing.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              You're receiving this email because you completed the AI-Powered Project Management course.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[sendCompletionEmail] error:", error);
    }
    return data;
  } catch (e) {
    console.error("[sendCompletionEmail] exception:", e);
  }
}