/**
 * Sample Cases for TrustShield Demonstrations
 * Clearly marked as demonstration data for educational reference.
 */

export const SAMPLE_CASES = [
  {
    id: "sample-telegram-job",
    title: "Remote Data Entry (\$48/hr via Telegram)",
    category: "job",
    badgeRisk: "High Risk",
    description: "Suspicious job offer for high-paying data entry requiring an immediate Telegram chat and sending an equipment check.",
    input: {
      type: "job",
      text: `Dear Candidate,
We reviewed your profile on the job board and are pleased to offer you the position of Remote Data Entry Clerk & Administrative Assistant at Global Logistics Inc.

Pay Rate: $48.50 per hour during 2 weeks training, then $62.00/hour.
Hours: Flexible (15-30 hrs/week). No prior experience needed. Fresh students welcome!

You were selected immediately without interview due to high demand. We will send you an upfront company check of $2,450 to purchase your home office equipment (Apple MacBook, encrypted software, laser printer) from our certified vendor.

To confirm your spot, please contact Mrs. Sarah Walker, Senior HR Coordinator, immediately on Telegram at @SarahHR_GlobalLogistics or via WhatsApp +1 (555) 019-4829 within 24 hours.

Regards,
Global Logistics Recruitment Team
careers@global-logistics-hiringportal.net`,
      url: "https://global-logistics-hiringportal.net/jobs/apply-fast?ref=telegram",
      field: "business",
      location: "remote",
      eligibility: "undergrad"
    }
  },
  {
    id: "sample-scholarship-fee",
    title: "Prestigious Merit Scholarship (\$85 Processing Fee)",
    category: "scholarship",
    badgeRisk: "High Risk",
    description: "Unsolicited scholarship notification claiming guaranteed \$10,000 award but requiring an upfront 'processing and disbursement fee'.",
    input: {
      type: "scholarship",
      text: `OFFICIAL NOTIFICATION: National Future Leaders Merit Grant 2026

Congratulations! You have been preliminarily selected as a recipient of the National Future Leaders Undergraduate Grant valued at $10,000 for the upcoming academic year.

Unlike government grants, this award has no GPA requirement and no essay requirement. You were nominated by the Global Academic Evaluation Council.

To complete disbursement of your $10,000 wire transfer directly to your bank account, recipients must pay a one-time refundable administrative processing and tax verification fee of $85.00 within 48 hours of this notice.

Failure to remit the registration fee will cause your award to be forfeited and transferred to the next candidate on the waiting list.

Send fee via Western Union, Zelle (payments@scholarship-awards-center.org), or Apple Gift Card.

National Grant Committee
admin@scholarship-awards-center.org`,
      url: "http://scholarship-awards-center.org/claim-award?id=99281",
      field: "general",
      location: "us",
      eligibility: "undergrad"
    }
  },
  {
    id: "sample-freelance-overpay",
    title: "Freelance Logo Design (Check Advance Request)",
    category: "freelance",
    badgeRisk: "Medium Risk",
    description: "Client offers \$1,500 for a simple logo but requests communication off-platform and mentions sending an advance check to pay an external illustrator.",
    input: {
      type: "freelance",
      text: `Hello Designer,
I found your portfolio online and love your creative style. I am launching an organic pet food brand and urgently need a logo and simple business card layout.

My budget is generous: $1,500 for the project. I need it completed in 5 days.

Because my company accountant handles disbursements in batches, I will mail you an official cashier's check for $4,500 upfront. You will deposit the check into your bank, keep your $1,500 fee, and wire the remaining $3,000 balance to our 3D packaging consultant via Zelle/Venmo so they can finalize our product render.

Please email me back at petcare.brandowner788@gmail.com with your full name, cell number, mailing address, and name of your bank so my accountant can issue the check today.`,
      url: "",
      field: "design",
      location: "remote",
      eligibility: "any"
    }
  },
  {
    id: "sample-gsoc-legitimate",
    title: "Open Source Summer Internship (Legitimate Standard)",
    category: "internship",
    badgeRisk: "Low Risk",
    description: "Official open-source mentorship program with transparent guidelines, no upfront fees, clear project proposals, and verified domains.",
    input: {
      type: "internship",
      text: `Google Summer of Code (GSoC) is a global, online program focused on bringing new contributors into open source software development. GSoC Contributors work with an open source organization on a 12+ week programming project under the guidance of mentors.

Key Program Details:
- Stipend: Evaluated by country purchasing power parity (PPP), disbursed in milestone phases upon mentor evaluations.
- No application fee is ever charged to students or contributors.
- Communication takes place on public community mailing lists, GitHub/GitLab repositories, and official Discord/IRC channels.
- Eligibility: Open to university students and open-source beginners age 18+.
- Application Process: Submit a project proposal directly via the official portal at summerofcode.withgoogle.com during the open application window. Mentors review proposals and publish accepted projects publicly.

For full program rules, timeline, and mentor organizations, review the official program site.`,
      url: "https://summerofcode.withgoogle.com/",
      field: "tech",
      location: "remote",
      eligibility: "undergrad"
    }
  },
  {
    id: "sample-hackathon-form",
    title: "Global AI Student Hackathon (Google Form with ID Request)",
    category: "competition",
    badgeRisk: "Medium Risk",
    description: "Promising \$20,000 prize pool hackathon hosted on an unbranded Google Form that asks for national ID/passport uploads prior to registration.",
    input: {
      type: "competition",
      text: `Join the 2026 International AI Breakthrough Hackathon!
Compete against top university innovators worldwide for over $20,000 in cash prizes and direct recruitment fast-tracks to Silicon Valley startups.

Registration is free. Teams of 1 to 4 students.
Hackathon date: Next weekend (48 hours virtual).

To secure your team's pass, complete our Google Forms registration link below. You must upload a high-resolution color scan of your government passport or national identity card and your student ID to verify nationality and identity prior to receiving the problem statement.

Hurry, only 50 team slots remaining before registration closes forever!`,
      url: "https://docs.google.com/forms/d/e/1FAIpQLSc9exampleHackathon2026/viewform",
      field: "tech",
      location: "remote",
      eligibility: "undergrad"
    }
  }
];
