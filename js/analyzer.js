/**
 * TrustShield Evidence-Based Verification & Heuristic Analyzer
 * 
 * Analyzes student opportunities, job offers, scholarships, freelance proposals, 
 * competitions, and recruiter messages through client-side pattern recognition.
 * 
 * IMPORTANT: This module performs heuristic rule matching on user-supplied text.
 * It NEVER claims to have performed live external database lookups or background checks.
 */

export function analyzeOpportunity({ type, text = "", url = "", field = "general", location = "remote", eligibility = "any" }) {
  const cleanText = text.trim();
  const cleanUrl = url.trim();

  // If text is virtually empty
  if (cleanText.length < 15 && !cleanUrl) {
    return {
      isValid: false,
      error: "Please provide offer text, email body, recruiter message, or a website URL to analyze."
    };
  }

  const extractedData = extractSignals(cleanText, cleanUrl, type);
  const claims = evaluateClaims(extractedData, cleanText, cleanUrl, type);
  const overall = calculateOverallRisk(claims, extractedData);
  const missingInfo = identifyMissingInformation(extractedData, type);
  const verificationChecklist = generateVerificationChecklist(extractedData, type, overall.level);

  return {
    isValid: true,
    timestamp: new Date().toISOString(),
    displayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    opportunityType: type,
    overallRisk: overall.level, // "Low", "Medium", "High"
    riskScore: overall.score, // 0 to 100
    riskTitle: overall.title,
    riskSummary: overall.summary,
    confidence: overall.confidence, // e.g. "High Confidence", "Moderate Confidence"
    confidenceExplanation: overall.confidenceExplanation,
    claims: claims,
    missingInformation: missingInfo,
    verificationChecklist: verificationChecklist,
    extractedSignals: extractedData,
    safeAlternativesNeeded: overall.level === "High" || overall.level === "Medium"
  };
}

/**
 * Extract pattern signals from text and URL
 */
function extractSignals(text, url, type) {
  const lower = text.toLowerCase();
  const urlLower = url.toLowerCase();

  // 1. Financial Red Flags & Positive Transparency
  const hasNoFeeExplicit = /(?:no|never|zero|without\s*any)\s*(?:application\s*fees?|registration\s*fees?|processing\s*fees?|fees?|charges?)|free\s*of\s*charge|never\s*charges?\s*a\s*fee/i.test(text);

  // Only flag fee if not explicitly negated by statements like "never application fees" or "no application fee"
  let hasFee = /(?:must\s*pay|pay\s*(?:a|an)|remit|require[sd]?\s*(?:a|an)?|charge[sd]?|refundable)\s*(?:application|registration|processing|administrative|deposit|tax|background\s*check|starter\s*kit)?\s*fee/i.test(text)
    || /(?:processing\s*fee|administrative\s*fee|registration\s*fee|deposit\s*fee|tax\s*fee|background\s*check\s*fee|refundable\s*fee|starter\s*kit\s*fee)\s*of\s*\$\d+/i.test(text);

  if (hasNoFeeExplicit && !hasFee) {
    hasFee = false;
  }

  const hasMoneyTransfer = /(western\s*union|moneygram|wire\s*transfer|zelle|venmo|cash\s*app|crypto|bitcoin|usdt|apple\s*gift\s*card|steam\s*card|gift\s*card)/i.test(text);
  const hasCheckAdvance = /(send\s*you\s*a\s*check|cashier['’]?s\s*check|mail\s*you\s*a\s*check|deposit\s*the\s*check|purchase\s*equipment|certified\s*vendor|wire\s*the\s*remaining|keep\s*your\s*fee\s*and\s*send)/i.test(text);
  const hasUnrealisticPay = /(\$([4-9]\d|1\d\d)\s*(\/|\s*per\s*)hr|\$([4-9]\d|1\d\d)\s*per\s*hour|no\s*experience\s*(needed|required)\s*.*\$[4-9]\d)/i.test(text);

  // 2. Urgent / High Pressure Tactics
  const hasUrgency = /(within\s*(24|48|12|2|4)\s*hours|immediately|act\s*now|forfeited|only\s*\d+\s*spots?\s*(left|remaining)|expires\s*today|urgent\s*response)/i.test(text);
  const hasGuaranteedWin = /(selected\s*immediately|congratulations\s*you\s*have\s*been\s*selected|guaranteed\s*(scholarship|award|job|income)|no\s*interview\s*needed|without\s*interview|preliminarily\s*selected)/i.test(text);

  // 3. Communications & Off-Platform Channels
  const hasTelegram = /(telegram|@\w*hr|@\w*recruit|t\.me\/)/i.test(text) || urlLower.includes("t.me");
  const hasWhatsApp = /(whatsapp|\+1\s*\(\d{3}\)\s*\d{3}-\d{4})/i.test(text) || urlLower.includes("wa.me");
  const hasGenericEmail = /@(?:gmail|yahoo|hotmail|outlook|proton|protonmail|aol|icloud)\.com/i.test(text);
  const hasWorkEmail = /@([a-z0-9\-]+\.(?:com|org|edu|gov|io|net|co|ai))/i.exec(text);

  // 4. Identity & Sensitive Info Demands
  const hasSensitiveDataRequest = /(upload\s*.*passport|national\s*id|social\s*security|ssn|driver['’]?s\s*license|bank\s*account\s*number|routing\s*number|credit\s*card\s*details|login\s*credentials)/i.test(text);

  // 5. URL Analysis
  const hasShortener = /(bit\.ly|tinyurl\.com|rb\.gy|is\.gd|cutt\.ly|t\.co|shorturl\.at)/i.test(text) || /(bit\.ly|tinyurl\.com|rb\.gy|is\.gd|cutt\.ly|t\.co)/i.test(urlLower);
  const hasFormHosting = /(docs\.google\.com\/forms|forms\.gle|typeform\.com|formstack\.com|jotform\.com)/i.test(text) || /(docs\.google\.com\/forms|forms\.gle|typeform\.com|formstack\.com|jotform\.com)/i.test(urlLower);
  const hasLookalikeDomain = /(hiringportal|jobs-portal|careers-department|hr-recruit|awards-center|grants-approval)/i.test(text) || /(hiringportal|jobs-portal|careers-department|hr-recruit|awards-center|grants-approval)/i.test(urlLower);
  const hasLegitEduGov = /(\.edu|\.gov|\.ac\.uk|\.int)/i.test(text) || /(\.edu|\.gov|\.ac\.uk|\.int)/i.test(urlLower);

  // 6. Positive / Transparent indicators
  const hasTransparentProcess = /(interview\s*process|public\s*repository|github\.com|gitlab\.com|mentorship|official\s*portal|transparent|timeline|milestone)/i.test(text);
  const hasNoFeeExplicit2 = /(no\s*fee|free\s*of\s*charge|never\s*charges?\s*a\s*fee|zero\s*application\s*cost)/i.test(text);

  return {
    hasFee,
    hasMoneyTransfer,
    hasCheckAdvance,
    hasUnrealisticPay,
    hasUrgency,
    hasGuaranteedWin,
    hasTelegram,
    hasWhatsApp,
    hasGenericEmail,
    workEmailMatch: hasWorkEmail ? hasWorkEmail[1] : null,
    hasSensitiveDataRequest,
    hasShortener,
    hasFormHosting,
    hasLookalikeDomain,
    hasLegitEduGov,
    hasTransparentProcess,
    hasNoFeeExplicit
  };
}

/**
 * Evaluate specific claims into evidence-backed breakdowns
 */
function evaluateClaims(signals, text, url, opportunityType) {
  const claims = [];

  // Claim 1: Financial & Compensation Integrity
  if (signals.hasFee || signals.hasCheckAdvance || signals.hasMoneyTransfer) {
    claims.push({
      id: "claim-financial",
      category: "Financial Terms",
      title: "Upfront Payment or Check Advance Requirement",
      claimText: "The opportunity requires an upfront processing/registration fee, equipment check advance, or wire/crypto transfer.",
      evidenceFound: signals.hasFee
        ? "Explicit mentions of 'fee', 'administrative charge', or 'refundable deposit' detected in text."
        : signals.hasCheckAdvance
          ? "Instructions to deposit an employer check and wire funds to a third-party vendor or consultant."
          : "Requests to send money via non-reversible payment rails (Zelle, wire transfer, gift cards, or crypto).",
      source: "Client-side Pattern Analysis (Text Examination)",
      dateChecked: "Evaluated just now",
      status: "Contradicts Standard Practice", // "Supports Standard Practice", "Raises Concern", "Contradicts Standard Practice", "Unverified / Incomplete"
      statusBadge: "negative",
      explanation: "Legitimate employers and official scholarships never ask students to pay upfront application or background fees, nor do they send advance checks requiring funds to be forwarded elsewhere (the classic fake check scam).",
      uncertainty: "If an accredited university has a standard application fee for degree admissions, that is normal; however, jobs, internships, and scholarships never charge candidates to receive pay or awards."
    });
  } else if (signals.hasNoFeeExplicit) {
    claims.push({
      id: "claim-financial-positive",
      category: "Financial Terms",
      title: "Transparent Zero-Fee Policy",
      claimText: "The program explicitly states that it is free to apply with zero candidate fees.",
      evidenceFound: "Clear statement in text confirming no application or registration fees are charged.",
      source: "Client-side Pattern Analysis (Text Examination)",
      dateChecked: "Evaluated just now",
      status: "Supports Standard Practice",
      statusBadge: "positive",
      explanation: "Legitimate student programs, research fellowships, and government/corporate internships do not charge fees to candidates.",
      uncertainty: "Self-declaration of 'no fees' should still be corroborated by ensuring no hidden deposit is requested later in the process."
    });
  } else {
    claims.push({
      id: "claim-financial-neutral",
      category: "Financial Terms",
      title: "Upfront Cost Verification",
      claimText: "No explicit upfront payment or check cashing advance was identified in the provided text.",
      evidenceFound: "No payment keywords (Zelle, wire, fee, gift card) detected in current submission.",
      source: "Client-side Pattern Analysis (Text Examination)",
      dateChecked: "Evaluated just now",
      status: "Does Not Establish Claim",
      statusBadge: "neutral",
      explanation: "While no payment requests appear in the initial message, scammers often introduce fees or equipment checks later during onboarding.",
      uncertainty: "Keep your guard up: if any party asks you to deposit a check, pay for equipment, or buy software later, halt immediately."
    });
  }

  // Claim 2: Recruiter Communication Channel & Affiliation
  if (signals.hasTelegram || signals.hasWhatsApp) {
    claims.push({
      id: "claim-channel",
      category: "Communication Channel",
      title: "Informal or Off-Platform Messaging Channel",
      claimText: "The recruiter or organization directs candidates to Telegram, WhatsApp, or informal messaging instead of official enterprise channels.",
      evidenceFound: `Detected invitation to connect via ${signals.hasTelegram ? "Telegram" : "WhatsApp"} for interviews or confirmation.`,
      source: "Client-side Pattern Analysis (Channel Detection)",
      dateChecked: "Evaluated just now",
      status: "Contradicts Standard Practice",
      statusBadge: "negative",
      explanation: "Reputable companies, universities, and organizations conduct recruitment through company email domains, verified applicant tracking systems (Greenhouse, Lever, Workday), or official video platforms (Zoom, Teams, Google Meet), never encrypted text chats.",
      uncertainty: "In rare informal student club settings WhatsApp may be used for group chats, but professional hiring and grant disbursements never occur exclusively via Telegram."
    });
  } else if (signals.hasGenericEmail) {
    claims.push({
      id: "claim-email-domain",
      category: "Recruiter Identity",
      title: "Free Public Email Provider Used for Corporate/Grant Outreach",
      claimText: "Recruiter contacts candidates from a public webmail domain (Gmail, Yahoo, Outlook) rather than an official organizational domain.",
      evidenceFound: "Email address in text uses a free webmail service instead of a corporate or university domain.",
      source: "Client-side Pattern Analysis (Domain Syntax)",
      dateChecked: "Evaluated just now",
      status: "Raises Concern",
      statusBadge: "warning",
      explanation: "Established corporations, universities, and non-profits maintain their own custom email domains (@company.com, @edu). Using a free Gmail account is a common warning sign of impersonation or unauthorized recruitment.",
      uncertainty: "Solo startup founders or independent researchers occasionally use personal email, but large company claims paired with @gmail are almost always fraudulent."
    });
  } else if (signals.workEmailMatch) {
    claims.push({
      id: "claim-work-domain",
      category: "Recruiter Identity",
      title: "Custom Domain Present in Contact Details",
      claimText: `Contact email appears to use custom domain (@${signals.workEmailMatch}).`,
      evidenceFound: `Domain @${signals.workEmailMatch} identified in message.`,
      source: "Client-side Pattern Analysis (Domain Syntax)",
      dateChecked: "Evaluated just now",
      status: signals.hasLookalikeDomain ? "Raises Concern" : "Supports Standard Practice",
      statusBadge: signals.hasLookalikeDomain ? "warning" : "positive",
      explanation: signals.hasLookalikeDomain
        ? "The domain contains hyphenated buzzwords like '-hiringportal' or '-careers', which often indicates a newly registered spoof domain pretending to be a real company."
        : "Using a dedicated domain aligns with legitimate organizational infrastructure.",
      uncertainty: "Domain existence alone does not prove the sender has authorization. Email display names can also be spoofed; verify the domain WHOIS age and official company website."
    });
  }

  // Claim 3: Selection Process & Urgency
  if (signals.hasGuaranteedWin || signals.hasUrgency) {
    claims.push({
      id: "claim-process",
      category: "Hiring & Selection Process",
      title: "Immediate Selection Without Review or High Artificial Pressure",
      claimText: "The submission claims candidate was selected immediately without interview, or imposes extreme urgency (24-48 hour ultimatum).",
      evidenceFound: [
        signals.hasGuaranteedWin ? "Phrasing indicating instant selection without prior interview/application." : null,
        signals.hasUrgency ? "Short deadline countdown or threat that offer will be forfeited." : null
      ].filter(Boolean).join(" "),
      source: "Client-side Pattern Analysis (Psychological Signal Detection)",
      dateChecked: "Evaluated just now",
      status: "Contradicts Standard Practice",
      statusBadge: "negative",
      explanation: "Scammers create artificial urgency to prevent students from having time to consult parents, university advisors, or research the company independently.",
      uncertainty: "Legitimate job offers have reasonable acceptance deadlines (typically 1 to 2 weeks), but immediate hires without any technical or behavioral interview are virtually never legitimate."
    });
  } else if (signals.hasTransparentProcess) {
    claims.push({
      id: "claim-process-transparent",
      category: "Hiring & Selection Process",
      title: "Documented Milestone & Evaluation Process",
      claimText: "The opportunity mentions structured interview phases, mentor evaluations, or transparent public guidelines.",
      evidenceFound: "Structured references to evaluation timelines, public repositories, or mentor reviews.",
      source: "Client-side Pattern Analysis (Process Evaluation)",
      dateChecked: "Evaluated just now",
      status: "Supports Standard Practice",
      statusBadge: "positive",
      explanation: "Legitimate programs publish transparent eligibility rules, multi-stage evaluations, and clear milestone criteria.",
      uncertainty: "Always check that the interview process actually takes place before signing any agreement."
    });
  }

  // Claim 4: Data Privacy & Document Upload Demands
  if (signals.hasSensitiveDataRequest) {
    claims.push({
      id: "claim-privacy",
      category: "Data Privacy & Identity",
      title: "Premature Request for Government ID, Bank Data, or SSN",
      claimText: "User is asked to upload scans of passport, national identity card, SSN, or bank account credentials.",
      evidenceFound: "Submission requests high-resolution identity documents or financial credentials before a verified written contract or formal employment.",
      source: "Client-side Pattern Analysis (PII Vulnerability Check)",
      dateChecked: "Evaluated just now",
      status: "Contradicts Standard Practice",
      statusBadge: "negative",
      explanation: "Identity theft rings harvest passport scans, student IDs, and SSNs through fake hackathons, scholarships, and job postings. Legitimate employers only request I-9 / tax verification documents after an official signed offer letter and through secure, audited HR systems.",
      uncertainty: "Visa sponsorship for international travel may require passport details later, but never on an unauthenticated Google Form or early stage application."
    });
  }

  // Claim 5: Web Links & Application Portals
  if (signals.hasShortener) {
    claims.push({
      id: "claim-url-shortener",
      category: "Application URL & Portal",
      title: "Obfuscated / Shortened URL Link",
      claimText: "The submission relies on a URL shortener (e.g., bit.ly, tinyurl) concealing the actual destination.",
      evidenceFound: "Shortened link detected in text or submission URL.",
      source: "Client-side Pattern Analysis (URL Deobfuscation Warning)",
      dateChecked: "Evaluated just now",
      status: "Raises Concern",
      statusBadge: "warning",
      explanation: "Shorteners hide phishing targets, credential harvesting pages, and drive-by malware downloads. Reputable organizations provide transparent links to their primary domains.",
      uncertainty: "Do not click shortened links directly. Use a URL expansion tool or search the company's official website manually."
    });
  } else if (signals.hasFormHosting && (opportunityType === "job" || opportunityType === "scholarship")) {
    claims.push({
      id: "claim-url-form",
      category: "Application URL & Portal",
      title: "Unbranded Public Form Used for Enterprise Application",
      claimText: "Application directs candidates to a free Google Form or Typeform rather than an integrated applicant tracking system.",
      evidenceFound: "Link to Google Forms or third-party form builder detected.",
      source: "Client-side Pattern Analysis (Infrastructure Check)",
      dateChecked: "Evaluated just now",
      status: "Raises Concern",
      statusBadge: "warning",
      explanation: "While university student clubs or small hackathons occasionally use Google Forms, established corporations and major scholarship foundations host applications on secure, dedicated portals.",
      uncertainty: "Acceptable for grassroots campus student initiatives, but highly suspicious for corporations claiming significant funding or high salaries."
    });
  } else if (signals.hasLegitEduGov) {
    claims.push({
      id: "claim-url-edugov",
      category: "Application URL & Portal",
      title: "Accredited Domain Extension Identified (.edu / .gov)",
      claimText: "The link or text references an accredited academic (.edu) or government (.gov) domain.",
      evidenceFound: "Verified .edu / .gov top-level domain pattern present.",
      source: "Client-side Pattern Analysis (TLD Verification)",
      dateChecked: "Evaluated just now",
      status: "Supports Standard Practice",
      statusBadge: "positive",
      explanation: ".edu and .gov domains require strict organizational verification and accreditation to be issued, making spoofed registrations extremely rare.",
      uncertainty: "Ensure the email or link is truly pointing to the domain itself and not simply mentioning the name inside a misleading subpath."
    });
  }

  // Claim 6: Compensation vs Role Reasonableness
  if (signals.hasUnrealisticPay) {
    claims.push({
      id: "claim-pay-unrealistic",
      category: "Compensation Assessment",
      title: "Outsized Pay Rate for Entry-Level or Zero-Experience Tasks",
      claimText: "Compensation (\$45–\$75+/hr) is significantly higher than market rates for basic remote data entry or administrative tasks.",
      evidenceFound: "High hourly wage coupled with 'no experience needed' or 'fresh students welcome' statements.",
      source: "Client-side Pattern Analysis (Market Benchmark Heuristic)",
      dateChecked: "Evaluated just now",
      status: "Contradicts Standard Practice",
      statusBadge: "negative",
      explanation: "Scammers deliberately advertise inflated pay rates to entice eager students into disregarding safety protocols.",
      uncertainty: "Specialized software engineering or quantitative trading internships can pay \$50+/hr, but general data entry, typing, or basic administration never commands such wages."
    });
  }

  return claims;
}

/**
 * Compute overall risk score and label
 */
function calculateOverallRisk(claims, signals) {
  let score = 20; // Base score (low-moderate baseline)

  // Negative severe signals
  if (signals.hasFee) score += 35;
  if (signals.hasCheckAdvance) score += 40;
  if (signals.hasTelegram) score += 25;
  if (signals.hasMoneyTransfer) score += 30;
  if (signals.hasGuaranteedWin && signals.hasUrgency) score += 25;
  if (signals.hasSensitiveDataRequest) score += 25;
  if (signals.hasUnrealisticPay) score += 20;
  if (signals.hasLookalikeDomain) score += 20;
  if (signals.hasGenericEmail && signals.hasUnrealisticPay) score += 20;

  // Positive signals
  if (signals.hasLegitEduGov) score -= 30;
  if (signals.hasTransparentProcess) score -= 25;
  if (signals.hasNoFeeExplicit) score -= 15;

  score = Math.max(5, Math.min(95, score));

  if (score >= 60) {
    return {
      level: "High",
      score,
      title: "High Risk – Strong Warning Signals Detected",
      summary: "This opportunity exhibits multiple classic patterns commonly associated with employment, scholarship, or advance-fee scams. Do NOT pay fees, do NOT deposit checks, and do NOT provide personal or banking information.",
      confidence: "High Confidence",
      confidenceExplanation: "Based on unambiguous heuristic indicators (such as upfront payment requests, check advance instructions, or informal messaging channels like Telegram)."
    };
  } else if (score >= 35) {
    return {
      level: "Medium",
      score,
      title: "Medium Risk – Caution & Independent Verification Required",
      summary: "This opportunity displays ambiguous signals, unverified channels, or incomplete corporate credentials. Exercise caution and verify the organization through official independent channels before proceeding.",
      confidence: "Moderate Confidence",
      confidenceExplanation: "Heuristic rules identified incomplete or non-standard contact patterns (such as webmail addresses, third-party forms, or vague corporate affiliation)."
    };
  } else {
    return {
      level: "Low",
      score,
      title: "Low Risk – Typical Legitimate Patterns Observed",
      summary: "No prominent scam signals were detected in the provided submission. The text aligns with standard institutional or recruitment practices. However, automated analysis is not a guarantee of safety.",
      confidence: "Moderate Confidence",
      confidenceExplanation: "Based on transparent processes, absence of upfront fee demands, and standard organizational indicators. Always verify final offers through your school's career portal."
    };
  }
}

/**
 * Identify missing elements that could not be verified automatically
 */
function identifyMissingInformation(signals, opportunityType) {
  const missing = [];

  missing.push({
    item: "Recruiter Corporate Employment Verification",
    reason: "Client-side analysis cannot access private corporate HR employee registries or verify if the individual is authorized to extend offers.",
    action: "Contact the company's official HR department or verify the recruiter's active presence on LinkedIn with authentic employee connections."
  });

  missing.push({
    item: "Official Career Portal Listing Match",
    reason: "We cannot verify whether this specific opening exists on the company's official corporate ATS (e.g., Workday, Greenhouse, or Lever).",
    action: "Navigate directly to the organization's official homepage, click 'Careers', and search for the job requisition ID independently."
  });

  if (signals.hasCheckAdvance || signals.hasFee) {
    missing.push({
      item: "Authenticity of Disbursement Check / Entity Registration",
      reason: "Automated analysis cannot authenticate physical bank routing numbers or corporate state entity filings.",
      action: "Never deposit an unexpected check. Consult your bank's fraud department before attempting to deposit any check from a remote employer."
    });
  }

  missing.push({
    item: "Sender Email Header Authenticity (SPF / DKIM / DMARC)",
    reason: "Pasted text does not contain cryptographic email headers; display names and 'From' lines can be spoofed in text.",
    action: "Inspect the raw email headers in your email client to verify that the message passed SPF, DKIM, and DMARC alignment."
  });

  return missing;
}

/**
 * Generate actionable verification checklist for student
 */
function generateVerificationChecklist(signals, opportunityType, riskLevel) {
  const items = [
    {
      id: "check-1",
      task: "Search the organization's official website independently",
      detail: "Open a fresh browser tab and manually search for the company or foundation. Never rely solely on links sent inside the message.",
      critical: true
    },
    {
      id: "check-2",
      task: "Confirm the opportunity exists on the official career or awards page",
      detail: "Search the job title or scholarship name on the organization's verified careers or grant listings page.",
      critical: true
    },
    {
      id: "check-3",
      task: "Verify recruiter credentials through official channels",
      detail: "Search for the recruiter on LinkedIn. Check if their profile has mutual connections, verified employment, and matches the corporate email domain.",
      critical: false
    },
    {
      id: "check-4",
      task: "Never send money, purchase equipment, or cash checks for an employer",
      detail: "Legitimate organizations provide equipment directly via corporate courier or reimburse through documented payroll, never via personal checks or advance wire transfers.",
      critical: riskLevel === "High"
    },
    {
      id: "check-5",
      task: "Consult your university career center or academic advisor",
      detail: "Share the offer details with your campus career counselor or financial aid office for an expert second opinion.",
      critical: false
    }
  ];

  if (signals.hasTelegram || signals.hasWhatsApp) {
    items.unshift({
      id: "check-telegram",
      task: "Request an interview via official corporate videoconferencing",
      detail: "Politely insist on conducting interviews through standard corporate platforms (Google Meet, Zoom, Teams) linked to an official corporate email address.",
      critical: true
    });
  }

  if (signals.hasFee) {
    items.unshift({
      id: "check-fee",
      task: "Halt payment immediately – do not transfer any funds",
      detail: "Legitimate scholarships and corporate internships do not charge application, processing, or disbursement fees.",
      critical: true
    });
  }

  return items;
}
