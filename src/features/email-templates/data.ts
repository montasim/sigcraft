export type EmailCategory = "Job search" | "Clients" | "General"

export type EmailTemplate = {
  category: EmailCategory
  title: string
  when: string
  subject: string
  body: string
}

// Text in [brackets] is filled in each time; the UI highlights it.
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    category: "Job search",
    title: "Applying for a role",
    when: "Cold email to a hiring manager, resume attached.",
    subject: "Application: [Role] at [Company]",
    body: `Hi [Name],

I'm applying for the [Role] role at [Company]. I have 4+ years of experience building products with React, Next.js, Node.js and TypeScript, and I currently own the frontend architecture of a multi-service platform.

A few results that match what your team is looking for:
• Cut cloud infrastructure costs by 70% by moving to Azure with automated CI/CD
• Improved application performance by 40% and reached Lighthouse scores of 90+
• Built a real-time computer vision pipeline that holds 60 FPS at 99.9% reliability

My resume is attached, and you can see more of my work at montasim.dev. I can start immediately and am open to remote, on-site or hybrid work.

Would you be open to a short call this week or next?

Best regards,`,
  },
  {
    category: "Job search",
    title: "Replying to a recruiter",
    when: "A recruiter reached out and you want to move forward.",
    subject: "Re: [Role] at [Company]",
    body: `Hi [Name],

Thank you for reaching out. The [Role] position at [Company] sounds like a strong fit, and I'd like to learn more.

A quick summary of my background: I'm a Senior Software Engineer with 4+ years across React, Next.js, Node.js and TypeScript, with recent work on real-time and AI-driven features.

I'm available for a call on [First day] or [Second day] between [Start time] and [End time] (UTC+6). If another time works better for you, let me know and I'll adjust.

Could you also share the salary range and what the interview process looks like?

Best regards,`,
  },
  {
    category: "Job search",
    title: "Following up on an application",
    when: "7 to 10 days after applying with no reply.",
    subject: "Following up: [Role] application",
    body: `Hi [Name],

I applied for the [Role] position at [Company] on [Application date] and wanted to check on the status of my application.

I'm still very interested in the role, especially [something specific about the team or product]. I'm happy to share more about my recent work or answer any questions.

Thank you for your time.

Best regards,`,
  },
  {
    category: "Job search",
    title: "Thank you after an interview",
    when: "Within 24 hours of each interview round.",
    subject: "Thank you for today's conversation",
    body: `Hi [Name],

Thank you for taking the time to speak with me today about the [Role] position. I enjoyed learning about [topic you discussed], and it made me even more excited about the work your team is doing.

Our conversation about [specific challenge they mentioned] stayed with me. It's close to problems I've worked on before, such as [one-line example from your experience].

Please let me know if you need anything else from me. I look forward to hearing about the next steps.

Best regards,`,
  },
  {
    category: "Job search",
    title: "Asking for a referral",
    when: "To a connection at a company you're applying to.",
    subject: "Quick question about [Company]",
    body: `Hi [Name],

I hope you're doing well. I noticed that [Company] is hiring a [Role], and I'd like to apply. Since you work there, would you be comfortable referring me?

For context, I'm a Senior Software Engineer with 4+ years in React, Next.js, Node.js and TypeScript. You can see my work at montasim.dev, and I've attached my resume.

Here's the job posting: [Job link]

No pressure at all if the timing isn't right. Either way, I'd really appreciate any advice about the team.

Best regards,`,
  },
  {
    category: "Job search",
    title: "Declining an offer",
    when: "Saying no politely while keeping the door open.",
    subject: "Re: Offer for [Role]",
    body: `Hi [Name],

Thank you for the offer for the [Role] position, and for the time you and the team spent with me during the process.

After careful thought, I've decided to accept another opportunity that is a closer match for my current goals. It wasn't an easy decision, and I have a lot of respect for what you're building at [Company].

I hope we can stay in touch.

Best regards,`,
  },
  {
    category: "Clients",
    title: "Replying to a project inquiry",
    when: "Someone asked you to build something for them.",
    subject: "Re: [Project name]",
    body: `Hi [Name],

Thanks for getting in touch about [Project name]. From your message, it sounds like you need [one-line summary of what they want].

To give you an accurate estimate, could you share:
• The main features you need in the first version
• Your target timeline and launch date
• Any existing designs, code or tools I'd be working with
• Your budget range

Once I have these, I'll send a short proposal covering scope, timeline and cost. You can see similar work at montasim.dev.

Best regards,`,
  },
  {
    category: "General",
    title: "Requesting a meeting",
    when: "Setting up a short call with anyone.",
    subject: "20-minute call about [topic]?",
    body: `Hi [Name],

I'd like to set up a short call to discuss [topic]. It should take about 20 minutes.

I'm free at these times:
• [First day and date] at [First time] (UTC+6)
• [Second day and date] at [Second time] (UTC+6)

If neither works for you, please suggest a time that does.

Best regards,`,
  },
]
