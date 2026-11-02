/**
 * TrustShield Safe Alternatives Engine
 * Curated, verified platforms and directories for students seeking legitimate opportunities.
 * All links point to official platform homepages.
 */

export const SAFE_DIRECTORIES = {
  internship: [
    {
      name: "Handshake",
      url: "https://joinhandshake.com",
      domain: "joinhandshake.com",
      badge: "University Vetted",
      field: "all",
      description: "College career network partnering with 1,400+ accredited universities where employers must be vetted by university career centers.",
      whySafer: "Employers must be verified through university relationships, drastically reducing impersonation scams."
    },
    {
      name: "Google Summer of Code (GSoC)",
      url: "https://summerofcode.withgoogle.com",
      domain: "summerofcode.withgoogle.com",
      badge: "Open Source / Tech",
      field: "tech",
      description: "Prestigious global stipended mentorship program matching students with verified open-source software organizations.",
      whySafer: "All mentor organizations and project proposals are publicly audited and managed directly on Google's infrastructure."
    },
    {
      name: "National Science Foundation REU",
      url: "https://www.nsf.gov/crssprgm/reu/",
      domain: "nsf.gov",
      badge: "Research / STEM",
      field: "research",
      description: "Research Experiences for Undergraduates (REU) funded by the U.S. Federal Government across hundreds of accredited universities.",
      whySafer: "Funded directly through federal NSF grants with structured stipends, housing, and university faculty mentors."
    },
    {
      name: "WayUp",
      url: "https://www.wayup.com",
      domain: "wayup.com",
      badge: "Early Career",
      field: "all",
      description: "Dedicated platform for college students and recent grads with verified top employers and structured internship listings.",
      whySafer: "Employer profiles undergo compliance screening before postings go live to early-career candidates."
    },
    {
      name: "USAJOBS Pathways Program",
      url: "https://www.usajobs.gov/studentsandgrads",
      domain: "usajobs.gov",
      badge: "Government / Public Sector",
      field: "all",
      description: "Official United States Federal Government portal for paid student internships and recent graduate careers.",
      whySafer: "Official federal government (.gov) listings with strict anti-fraud safeguards and defined pay scales."
    }
  ],
  scholarship: [
    {
      name: "College Board BigFuture",
      url: "https://bigfuture.collegeboard.org/scholarship-search",
      domain: "bigfuture.collegeboard.org",
      badge: "Official College Board",
      field: "all",
      description: "Comprehensive, free scholarship search directory from the makers of the SAT and AP exams, with thousands of legitimate awards.",
      whySafer: "Zero fees to apply; all partner foundations and corporate sponsors are vetted by the College Board."
    },
    {
      name: "Fastweb",
      url: "https://www.fastweb.com",
      domain: "fastweb.com",
      badge: "Free Directory",
      field: "all",
      description: "Established student database matching high school and undergraduate students to vetted scholarships, grants, and college aid.",
      whySafer: "Follows a strict policy prohibiting fee-charging scholarship providers from listing on the network."
    },
    {
      name: "Scholarships.com",
      url: "https://www.scholarships.com",
      domain: "scholarships.com",
      badge: "Vetted Grants",
      field: "all",
      description: "One of the largest searchable scholarship databases filtered by major, GPA, military service, and student background.",
      whySafer: "Audited database with community fraud reporting and zero upfront application fees for legitimate listings."
    },
    {
      name: "Federal Student Aid (FAFSA)",
      url: "https://studentaid.gov",
      domain: "studentaid.gov",
      badge: "Federal Government",
      field: "all",
      description: "Official U.S. Department of Education portal for Pell Grants, federal work-study, and subsidized college aid.",
      whySafer: "Official federal portal (.gov); never charges fees to file or disburse government educational funding."
    },
    {
      name: "DAAD International Grants (Europe/Global)",
      url: "https://www.daad.de/en/",
      domain: "daad.de",
      badge: "International Exchange",
      field: "all",
      description: "Official German Academic Exchange Service supporting university study and research fellowships globally.",
      whySafer: "Official public entity financed by the German Federal Government; zero application fees."
    }
  ],
  job: [
    {
      name: "LinkedIn Official Career Portals",
      url: "https://www.linkedin.com/jobs",
      domain: "linkedin.com",
      badge: "Professional Network",
      field: "all",
      description: "World's largest professional network. Focus on Verified Employer Badges and company career pages.",
      whySafer: "Look for the shield checkmark on company pages and verify recruiter profiles against mutual connections."
    },
    {
      name: "Built In",
      url: "https://builtin.com",
      domain: "builtin.com",
      badge: "Tech & Startup Hubs",
      field: "tech",
      description: "Community and job board for tech hubs (NYC, Austin, SF, Boston, Remote) directly linked to verified company staff.",
      whySafer: "Requires companies to register corporate domains and showcases genuine office cultures and verified staff."
    },
    {
      name: "Wellfound (formerly AngelList Talent)",
      url: "https://wellfound.com",
      domain: "wellfound.com",
      badge: "Startup Ecosystem",
      field: "tech",
      description: "Platform for venture-backed startups and high-growth technology companies with transparent salary and equity ranges.",
      whySafer: "Lists direct founder and engineering manager contacts rather than third-party unauthorized recruiters."
    },
    {
      name: "Indeed (Direct Employer Postings)",
      url: "https://www.indeed.com",
      domain: "indeed.com",
      badge: "Broad Search",
      field: "all",
      description: "Global job marketplace. Always look for the 'Apply on Company Site' link rather than external quick forms.",
      whySafer: "Features company reviews, salary benchmarks, and employer identity confirmation badges."
    }
  ],
  freelance: [
    {
      name: "Upwork (Escrow & Milestone Protection)",
      url: "https://www.upwork.com",
      domain: "upwork.com",
      badge: "Escrow Protected",
      field: "all",
      description: "Leading freelancing marketplace requiring clients to fund milestones into escrow before work begins.",
      whySafer: "Protects against fake check scams and non-payment by locking client funds in escrow before you submit deliverables."
    },
    {
      name: "Fiverr Pro",
      url: "https://www.fiverr.com",
      domain: "fiverr.com",
      badge: "Payment Secured",
      field: "all",
      description: "Services marketplace with verified buyer payments, clear gig specifications, and built-in dispute resolution.",
      whySafer: "Buyers must pay upfront through the platform; payments are automatically held until order completion."
    },
    {
      name: "Contra",
      url: "https://contra.com",
      domain: "contra.com",
      badge: "Zero-Commission Freelance",
      field: "all",
      description: "Modern portfolio-first freelance platform featuring commission-free contracts with secure client milestone payouts.",
      whySafer: "Verified client identities and legally binding digital contracts backed by Stripe payment protection."
    }
  ],
  competition: [
    {
      name: "Devpost",
      url: "https://devpost.com",
      domain: "devpost.com",
      badge: "Official Hackathons",
      field: "tech",
      description: "The home for official developer hackathons sponsored by AWS, Google, Microsoft, and global universities.",
      whySafer: "All competitions feature public rules, transparent judging panels, and verified sponsor corporate profiles."
    },
    {
      name: "Major League Hacking (MLH)",
      url: "https://mlh.io",
      domain: "mlh.io",
      badge: "Student Hackathons",
      field: "tech",
      description: "Official student hackathon league empowering over 65,000 students globally each year through audited campus hackathons.",
      whySafer: "Enforces an official Code of Conduct, student mentorship, and hardware lab safety across all member events."
    },
    {
      name: "Kaggle Competitions",
      url: "https://www.kaggle.com/competitions",
      domain: "kaggle.com",
      badge: "Data Science & AI",
      field: "tech",
      description: "Premier machine learning platform offering benchmark datasets, code kernels, and audited prize pools.",
      whySafer: "Backed by Google; prize pools are held in trust and code is independently verified before payouts."
    },
    {
      name: "Unstop (formerly Dare2Compete)",
      url: "https://unstop.com",
      domain: "unstop.com",
      badge: "Global Student Competitions",
      field: "business",
      description: "Platform connecting university students to case competitions, corporate challenges, and campus hackathons.",
      whySafer: "Directly verified partnerships with university clubs and fortune 500 employer challenge sponsors."
    }
  ],
  recruiter_message: [
    {
      name: "LinkedIn Search & InMail",
      url: "https://www.linkedin.com",
      domain: "linkedin.com",
      badge: "Identity Verification",
      field: "all",
      description: "Cross-reference recruiter names against official company employee rosters and verify company page affiliations.",
      whySafer: "Legitimate enterprise recruiters use InMail or verified corporate email addresses matching the company domain."
    },
    {
      name: "Hunter.io Email Verifier",
      url: "https://hunter.io/email-verifier",
      domain: "hunter.io",
      badge: "Domain Verification",
      field: "all",
      description: "Free tool to verify if a recruiter's email domain has active MX records and matches standard company email patterns.",
      whySafer: "Quickly reveals whether an email is coming from a freshly registered lookalike domain or a personal webmail provider."
    }
  ]
};

/**
 * Filter safe alternatives based on category, field, and search parameters.
 */
export function getSafeAlternatives(category, field = "all") {
  const normalizedCategory = SAFE_DIRECTORIES[category] ? category : "job";
  const list = SAFE_DIRECTORIES[normalizedCategory] || [];

  if (!field || field === "all" || field === "general") {
    return list;
  }

  // Prioritize matching field, then append general matches
  const matched = list.filter(item => item.field === field || item.field === "all");
  return matched.length > 0 ? matched : list;
}
