"""
TrustShield - Opportunity Risk Assessment Backend Server
Standard library only: Python 3.8+ (http.server, json, re, urllib)
Zero external dependencies required.
"""

import http.server
import json
import os
import re
import socketserver
import sys
import urllib.parse
from datetime import datetime

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Curated Safe Alternatives Catalog
SAFE_ALTERNATIVES = [
    {
        "id": "alt-handshake",
        "name": "Handshake",
        "url": "https://joinhandshake.com",
        "types": ["internship", "job"],
        "fields": ["all", "tech", "business", "design", "arts", "healthcare", "science"],
        "reason": "Directly partnered with thousands of accredited colleges; employers must be vetted by university career centers.",
        "badge": "University Vetted"
    },
    {
        "id": "alt-linkedin",
        "name": "LinkedIn Official Job Board",
        "url": "https://www.linkedin.com/jobs",
        "types": ["internship", "job", "freelance"],
        "fields": ["all", "tech", "business", "design", "science"],
        "reason": "Offers verified company pages, recruiter profiles with verified employment badges, and employee connections.",
        "badge": "Verified Profiles"
    },
    {
        "id": "alt-nsf-reu",
        "name": "NSF Research Experiences for Undergraduates (REU)",
        "url": "https://www.nsf.gov/crssprgm/reu/",
        "types": ["internship", "scholarship"],
        "fields": ["science", "tech", "engineering", "math", "healthcare"],
        "reason": "Official US National Science Foundation funded academic research internships with guaranteed stipends and housing.",
        "badge": "Federal / Academic"
    },
    {
        "id": "alt-gsoc",
        "name": "Google Summer of Code (GSoC)",
        "url": "https://summerofcode.withgoogle.com",
        "types": ["internship", "competition", "freelance"],
        "fields": ["tech", "engineering"],
        "reason": "Official open-source mentorship program managed directly by Google with transparent stipends and public mentors.",
        "badge": "Verified Global Program"
    },
    {
        "id": "alt-usajobs",
        "name": "USAJOBS Pathways for Students & Grads",
        "url": "https://www.usajobs.gov/help/working-in-government/unique-hiring-paths/students/",
        "types": ["internship", "job"],
        "fields": ["all", "tech", "business", "science", "healthcare"],
        "reason": "Official portal for all U.S. Federal Government student internships and civil service roles. Zero recruitment fees.",
        "badge": "Official Government"
    },
    {
        "id": "alt-fastweb",
        "name": "Fastweb Scholarship Directory",
        "url": "https://www.fastweb.com",
        "types": ["scholarship"],
        "fields": ["all"],
        "reason": "Long-standing accredited scholarship search engine. Explicitly bans scholarships requiring application fees.",
        "badge": "Free Scholarship Search"
    },
    {
        "id": "alt-scholarships360",
        "name": "Scholarships360",
        "url": "https://scholarships360.org",
        "types": ["scholarship"],
        "fields": ["all", "tech", "business", "arts", "healthcare"],
        "reason": "Curated by higher education professionals. Screens out sweepstakes and fee-charging scholarship scams.",
        "badge": "Curated Directory"
    },
    {
        "id": "alt-devpost",
        "name": "Devpost Hackathons",
        "url": "https://devpost.com",
        "types": ["competition"],
        "fields": ["tech", "design", "engineering"],
        "reason": "The primary platform for university and corporate hackathons with transparent organizers, verified judges, and official rules.",
        "badge": "Verified Hackathons"
    },
    {
        "id": "alt-wellfound",
        "name": "Wellfound (formerly AngelList Talent)",
        "url": "https://wellfound.com",
        "types": ["internship", "job", "freelance"],
        "fields": ["tech", "business", "design"],
        "reason": "Startup hiring portal where compensation (salary & equity) is transparently listed and founders are linked.",
        "badge": "Transparent Startups"
    },
    {
        "id": "alt-upwork-enterprise",
        "name": "Upwork (Direct Client Verification)",
        "url": "https://www.upwork.com",
        "types": ["freelance"],
        "fields": ["tech", "design", "business", "arts"],
        "reason": "Includes escrow payment protection, client payment verification badges, and strict rules against off-platform payments.",
        "badge": "Escrow Protection"
    }
]

# Sample Demonstrations
DEMO_SAMPLES = [
    {
        "id": "demo-telegram-intern",
        "title": "Telegram Remote Data Entry Internship ($48/hr + Equipment Check)",
        "type": "internship",
        "field": "business",
        "location": "Remote",
        "eligibility": "Undergraduate",
        "url": "https://tinyurl.com/fast-remote-job2025",
        "text": """Congratulations! We reviewed your resume on a public student portal and are pleased to offer you a position as Remote Data Entry Assistant at Johnson & Horizon Logistics Corp.

Compensation is $48.50 per hour during flexible 20-hour work weeks. No prior experience is required. 

To complete your onboarding, contact our Hiring Supervisor Mr. Robert Vance immediately on Telegram (@RobertVanceHR_HQ) within 24 hours. Because this is a remote role, our finance team will issue you a cashier's check for $2,850 to purchase an Apple MacBook Pro and dedicated encrypted software from our approved vendor. You must deposit the check and wire payment to the vendor before your start date next Monday."""
    },
    {
        "id": "demo-google-scholarship",
        "title": "Unsolicited 'Google Global Youth' Scholarship ($10,000 + $65 Processing Fee)",
        "type": "scholarship",
        "field": "tech",
        "location": "Global",
        "eligibility": "Any Student",
        "url": "https://google-scholarships-portal-awards.org/apply-now",
        "text": """OFFICIAL NOTICE: Google Global Youth Excellence Scholarship 2026.
You have been shortlisted as one of the 50 finalists worldwide to receive a guaranteed $10,000 educational grant. 

To claim your grant and disburse funds to your university account, an administrative verification and processing fee of $65.00 must be remitted via wire transfer, gift card, or CashApp to our regional scholarship coordinator. 

Failure to submit this verification fee within 48 hours will forfeit your eligibility to the next candidate on the waiting list."""
    },
    {
        "id": "demo-nsf-reu",
        "title": "Legitimate University NSF REU Research Assistantship",
        "type": "internship",
        "field": "science",
        "location": "On-Campus / University Lab",
        "eligibility": "Rising Sophomores & Juniors in STEM",
        "url": "https://www.cmu.edu/robotics/reu/summer2026.html",
        "text": """Carnegie Mellon University Robotics Institute Summer Scholars (RISS) Program.
Funded in part by the National Science Foundation (NSF REU Site Award #2149887).

Program dates: June 1 - August 7, 2026. Participants receive a standard NSF stipend of $6,000 for the 10-week program, plus university campus housing and a travel reimbursement allowance. 

Applicants must be enrolled U.S. citizens or permanent residents with at least one semester of undergraduate study remaining. Application requires an academic transcript, resume, and two faculty letters of recommendation submitted through the official university portal (cmu.edu). There are never application fees."""
    },
    {
        "id": "demo-freelance-whatsapp",
        "title": "Freelance Client Demanding WhatsApp Migration & Tool Purchase",
        "type": "freelance",
        "field": "design",
        "location": "Remote",
        "eligibility": "Freelancers",
        "url": "https://bit.ly/creative-gig-task",
        "text": """Hello, I saw your design portfolio. We urgently need 5 landing page graphics completed by tomorrow night. Budget is $1,500. 

I don't like using this platform's messaging because of fees, so please text my direct personal WhatsApp at +1-949-555-0192 right now. 

Before starting, you must install our proprietary collaboration workspace tool available at http://cloud-designer-patcher.xyz/setup.exe. It will verify your workstation specs."""
    },
    {
        "id": "demo-startup-marketing",
        "title": "Early-Stage Startup Growth Marketing Internship (Needs Verification)",
        "type": "internship",
        "field": "business",
        "location": "San Francisco / Hybrid",
        "eligibility": "College Students",
        "url": "https://luminahealth.io/careers",
        "text": """Lumina Health (Seed-stage Y Combinator S24) is seeking a Growth Marketing Intern for Summer 2026.
You'll work closely with founders to scale student campus ambassador programs and manage TikTok/Instagram growth.

Stipend: $2,000/month stipend plus equity bonus potential. 15-20 hours/week.
Requirements: Current student with strong interest in digital health, active social media portfolio, and proficiency with Canva/Figma.
Interview process: 30-min intro call with founder, take-home 1-page strategy exercise, and final chat. Apply by emailing careers@luminahealth.io with your resume and portfolio."""
    }
]


def extract_claims_and_signals(opportunity_type, text, url=""):
    """
    Rule-based & heuristic NLP claim extraction and risk assessment.
    Returns:
      overall_risk: 'Low' | 'Medium' | 'High'
      confidence_score: int (0-100)
      confidence_text: str
      claims: list of claim objects
      missing_info: list of strings
      action_checklist: list of actionable next steps
      risk_factors_count: int
    """
    text_lower = text.lower() if text else ""
    url_lower = url.lower() if url else ""
    full_corpus = text_lower + " " + url_lower

    claims = []
    missing_info = []
    actions = []
    risk_points = 0
    positive_points = 0

    # -------------------------------------------------------------
    # CLAIM 1: Application Fee or Financial Payments Requested
    # -------------------------------------------------------------
    # Check for explicit negation of fees (e.g. "never application fees", "no application fee")
    no_fee_declared = bool(re.search(r"(?:never|no|zero|without\s*any)\s*(?:application\s*fees?|registration\s*fees?|processing\s*fees?|fees?|charges?)", text_lower))

    fee_patterns = [
        r"processing fee", r"administrative fee",
        r"registration fee", r"screening fee", r"wire transfer",
        r"gift card", r"cashapp", r"venmo", r"crypto", r"bitcoin", r"cashier'?s check",
        r"buy software", r"purchase.*equipment", r"vendor"
    ]
    if not no_fee_declared:
        fee_patterns.append(r"application fee")
        fee_patterns.append(r"deposit")

    matched_fees = [p for p in fee_patterns if re.search(p, text_lower)]

    if matched_fees:
        risk_points += 45
        claims.append({
            "claim": "Financial Payment or Upfront Fee Requirement",
            "category": "Financial Integrity",
            "evidence": f"Found direct references to upfront payment / money handling: {', '.join(set(matched_fees))}.",
            "source": "Heuristic textual pattern matching",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Concern",
            "impact": "CRITICAL RISK: Legitimate employers and scholarships never charge fees to apply, interview, or purchase equipment via third-party checks/vendors.",
            "uncertainty": "Unless this is an accredited university tuition or government licensing body, upfront money requests are the #1 hallmark of employment & grant scams.",
            "badge_type": "danger"
        })
        actions.append("Do NOT send money, purchase gift cards, or deposit any check provided by the recruiter.")
    else:
        positive_points += 15
        claims.append({
            "claim": "Financial Payment or Upfront Fee Requirement",
            "category": "Financial Integrity",
            "evidence": "No requests for application fees, equipment purchasing, wire transfers, or gift cards were detected.",
            "source": "Heuristic textual pattern matching",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Legitimacy",
            "impact": "Positive sign: the listing does not attempt an immediate advance-fee extraction.",
            "uncertainty": "Fraudulent actors sometimes withhold payment requests until after an interview phase.",
            "badge_type": "success"
        })

    # -------------------------------------------------------------
    # CLAIM 2: Communication Channels & Recruiter Credentials
    # -------------------------------------------------------------
    unusual_channels = [
        "telegram", "whatsapp", "signal", "wire", "skype",
        "hangouts", "direct message", "text my personal"
    ]
    free_email_providers = [
        "@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@aol.com", "@proton.me"
    ]

    found_channels = [c for c in unusual_channels if c in text_lower]
    found_free_emails = [e for e in free_email_providers if e in text_lower]

    edu_or_gov = any(domain in text_lower or domain in url_lower for domain in [".edu", ".gov", ".ac.uk", ".org"])
    
    if found_channels or found_free_emails:
        risk_points += 30
        details = []
        if found_channels:
            details.append(f"Redirects to chat apps ({', '.join(found_channels)})")
        if found_free_emails:
            details.append(f"Uses free webmail ({', '.join(found_free_emails)})")

        claims.append({
            "claim": "Recruiter Channel & Official Affiliation",
            "category": "Identity Verification",
            "evidence": f"Unusual communication channel detected: {'; '.join(details)}.",
            "source": "Linguistic & domain pattern matching",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Concern",
            "impact": "HIGH RISK: Legitimate corporate and institutional recruiters conduct hiring through verified enterprise emails and formal applicant portals, not chat apps.",
            "uncertainty": "Occasionally informal freelance gigs use WhatsApp, but established employers strictly prohibit it for hiring.",
            "badge_type": "danger"
        })
        actions.append("Verify the recruiter's name and corporate email directly on the company's official LinkedIn page or website.")
    elif edu_or_gov:
        positive_points += 25
        claims.append({
            "claim": "Recruiter Channel & Official Affiliation",
            "category": "Identity Verification",
            "evidence": "References official institutional TLD (.edu, .gov, or verified organization portal).",
            "source": "Domain syntax pattern matching",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Legitimacy",
            "impact": "Strong positive indicator: .edu and .gov domains require accredited educational or federal verification.",
            "uncertainty": "Check that the destination URL actually lands on the institutional root domain, not a compromised subfolder or spoofed redirect.",
            "badge_type": "success"
        })
    else:
        claims.append({
            "claim": "Recruiter Channel & Official Affiliation",
            "category": "Identity Verification",
            "evidence": "No corporate domain or explicit institutional email address was detected in the submitted text.",
            "source": "Text heuristic scan",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Inconclusive / Unverified",
            "impact": "Cannot confirm whether the sender is authentically affiliated with the purported organization.",
            "uncertainty": "Sender identity is unverified. Scammers frequently impersonate real corporate executives.",
            "badge_type": "warning"
        })
        missing_info.append("Verified recruiter email matching the company's official domain name (e.g. name@company.com).")

    # -------------------------------------------------------------
    # CLAIM 3: Compensation & Reward Realism
    # -------------------------------------------------------------
    high_pay_matches = re.findall(r"\$\s*([4-9]\d|\d{3,})\s*(?:/|\s*per|\s*an)\s*(?:hr|hour|day)", text_lower)
    unrealistic_scholarship = re.findall(r"\$\s*(\d{2,3},\d{3})\s*(?:grant|scholarship|prize|award)", text_lower)
    no_experience = any(k in text_lower for k in ["no experience", "anyone with a phone", "any age", "guaranteed award", "guaranteed position", "no interview"])

    if high_pay_matches and ("data entry" in text_lower or "assistant" in text_lower or "typing" in text_lower or no_experience):
        risk_points += 25
        claims.append({
            "claim": "Compensation Realism & Workload Proportionality",
            "category": "Economic Realism",
            "evidence": f"Promised compensation (${high_pay_matches[0]}/hr) is disproportionately high for entry-level tasks requiring little or no qualifications.",
            "source": "Heuristic wage benchmark analysis",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Concern",
            "impact": "ELEVATED RISK: Bait wages ($40-$80/hr for routine data entry) are used to lure candidates into fake equipment-check scams.",
            "uncertainty": "Specialized senior consulting can command high rates, but student entry-level work rarely exceeds standard market brackets.",
            "badge_type": "danger"
        })
    elif "stipend" in text_lower or "$" in text_lower:
        claims.append({
            "claim": "Compensation Realism & Workload Proportionality",
            "category": "Economic Realism",
            "evidence": "Compensation or stipend is mentioned within reasonable educational/market ranges.",
            "source": "Heuristic wage benchmark analysis",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Legitimacy",
            "impact": "Offers standard compensation language without hyper-inflated promises.",
            "uncertainty": "Stipend terms should always be verified in a formal written contract before commencement.",
            "badge_type": "neutral"
        })
    else:
        claims.append({
            "claim": "Compensation Realism & Workload Proportionality",
            "category": "Economic Realism",
            "evidence": "No clear compensation, hourly rate, or grant amount details were provided in the excerpt.",
            "source": "Text heuristic scan",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Inconclusive / Unverified",
            "impact": "Terms of remuneration remain unstated.",
            "uncertainty": "Unpaid roles must comply with applicable student labor standards and academic credit requirements.",
            "badge_type": "neutral"
        })
        missing_info.append("Specific compensation structure, payment schedule, or formal grant disbursement terms.")

    # -------------------------------------------------------------
    # CLAIM 4: Pressure Tactics & Artificial Urgency
    # -------------------------------------------------------------
    urgency_signals = [
        "urgent", "immediately", "within 24 hours", "within 48 hours",
        "act now", "limited spots left", "forfeit your eligibility",
        "today only", "deadline tonight", "hurry"
    ]
    found_urgency = [u for u in urgency_signals if u in text_lower]

    if found_urgency:
        risk_points += 20
        claims.append({
            "claim": "Urgency & High-Pressure Timelines",
            "category": "Psychological Manipulation",
            "evidence": f"Detected coercive urgency phrases: {', '.join(set(found_urgency))}.",
            "source": "Sentiment & urgency pattern analysis",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Concern",
            "impact": "MEDIUM RISK: Artificial deadlines prevent targets from consulting advisors, university staff, or researching the opportunity.",
            "uncertainty": "Legitimate rolling applications exist, but reputable employers provide reasonable review windows (several days to a week).",
            "badge_type": "warning"
        })
        actions.append("Take your time. Never make hurried decisions under artificial 24-48 hour deadlines.")
    else:
        positive_points += 10
        claims.append({
            "claim": "Urgency & High-Pressure Timelines",
            "category": "Psychological Manipulation",
            "evidence": "No coercive time pressure or rushed forfeiture threats detected.",
            "source": "Sentiment & urgency pattern analysis",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Legitimacy",
            "impact": "Allows candidate standard time to review and deliberate.",
            "uncertainty": "Watch out for pressure tactics introduced later during follow-up messages.",
            "badge_type": "success"
        })

    # -------------------------------------------------------------
    # CLAIM 5: URL & Destination Integrity
    # -------------------------------------------------------------
    shorteners = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "ow.ly", "rb.gy"]
    suspicious_tlds = [".xyz", ".top", ".club", ".work", ".click", ".buzz", ".guru", ".ru", ".cn", ".patcher"]
    download_threats = [".exe", ".bat", ".scr", ".zip", ".msi", "setup.exe", "patcher"]

    found_shortener = [s for s in shorteners if s in full_corpus]
    found_sus_tld = [t for t in suspicious_tlds if t in full_corpus]
    found_downloads = [d for d in download_threats if d in full_corpus]

    if found_downloads or found_sus_tld or found_shortener:
        risk_points += 35
        issues = []
        if found_downloads:
            issues.append(f"Direct executable file download ({', '.join(found_downloads)})")
        if found_shortener:
            issues.append(f"URL shortener concealing true destination ({', '.join(found_shortener)})")
        if found_sus_tld:
            issues.append(f"High-risk top-level domain ({', '.join(found_sus_tld)})")

        claims.append({
            "claim": "Website URL & Software Safety",
            "category": "Technical & Digital Security",
            "evidence": f"High risk link features detected: {'; '.join(issues)}.",
            "source": "URL structure & heuristic syntax analyzer",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Concern",
            "impact": "CRITICAL RISK: Potential malware delivery, phishing redirect, or credential theft.",
            "uncertainty": "Never download or execute files from unsolicited recruiters or unverified domains.",
            "badge_type": "danger"
        })
        actions.append("Do NOT download or run executable files (.exe, .zip). Check link destinations using VirusTotal or URL expanders.")
    elif url:
        claims.append({
            "claim": "Website URL & Software Safety",
            "category": "Technical & Digital Security",
            "evidence": f"URL provided ({url}) uses standard web protocols without obvious file download threats.",
            "source": "URL structure & heuristic syntax analyzer",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Inconclusive / Unverified",
            "impact": "Domain format is standard, but registration age and ownership were not externally verified.",
            "uncertainty": "Check WHOIS lookup to see if domain was registered recently (under 6 months is risky).",
            "badge_type": "neutral"
        })
    else:
        claims.append({
            "claim": "Website URL & Software Safety",
            "category": "Technical & Digital Security",
            "evidence": "No website URL or destination portal provided for technical inspection.",
            "source": "Input verification check",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Inconclusive / Unverified",
            "impact": "Cannot assess domain security or host legitimacy.",
            "uncertainty": "Legitimate opportunities should always have an official, publicly indexed corporate careers page.",
            "badge_type": "neutral"
        })
        missing_info.append("Official public URL linking to an indexed careers or program announcement page.")

    # -------------------------------------------------------------
    # CLAIM 6: Selection Rigor & Interview Process
    # -------------------------------------------------------------
    if "no interview" in text_lower or ("congratulations" in text_lower and "offer" in text_lower and "resume" not in text_lower):
        risk_points += 20
        claims.append({
            "claim": "Application & Vetting Rigor",
            "category": "Selection Authenticity",
            "evidence": "Immediate job offer or award granted without interview, live screening, or formal evaluation.",
            "source": "Linguistic vetting analyzer",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Concern",
            "impact": "HIGH RISK: Legitimate organizations never extend binding employment or major cash grants without competitive screening.",
            "uncertainty": "Pure sweepstakes exist, but legitimate academic scholarships and internships require rigorous vetting.",
            "badge_type": "danger"
        })
        actions.append("Request a live video interview via Zoom, Teams, or Google Meet with the hiring manager.")
    elif "interview" in text_lower or "recommendation" in text_lower or "transcript" in text_lower or "portfolio" in text_lower:
        positive_points += 15
        claims.append({
            "claim": "Application & Vetting Rigor",
            "category": "Selection Authenticity",
            "evidence": "Mentions standard professional evaluation stages (interviews, transcripts, recommendations, or portfolio reviews).",
            "source": "Linguistic vetting analyzer",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Supports Legitimacy",
            "impact": "Consistent with authentic hiring and academic grant procedures.",
            "uncertainty": "Ensure interviews take place via legitimate corporate video platforms, not text-only chats.",
            "badge_type": "success"
        })
    else:
        claims.append({
            "claim": "Application & Vetting Rigor",
            "category": "Selection Authenticity",
            "evidence": "Screening and interview requirements are not detailed in this excerpt.",
            "source": "Text heuristic scan",
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "verdict": "Inconclusive / Unverified",
            "impact": "Unable to determine the competitiveness or legitimacy of the selection process.",
            "uncertainty": "Ask the sender to outline the full stages of their hiring process.",
            "badge_type": "neutral"
        })

    # Standard actionable verification steps for student
    default_actions = [
        "Search the organization's official website independently in a new tab (never just click links in emails).",
        "Check whether this exact opportunity is listed on the organization's public Careers or News page.",
        "Contact the company's official HR department via contact details listed on their main website to confirm recruiter validity.",
        "Consult your campus career center or academic advisor before submitting sensitive documents."
    ]
    for act in default_actions:
        if act not in actions:
            actions.append(act)

    # -------------------------------------------------------------
    # Overall Risk Calculation & Confidence Indicator
    # -------------------------------------------------------------
    if risk_points >= 40:
        overall_risk = "High"
        risk_color = "danger"
        risk_summary = "Multiple high-severity risk signals detected. This submission exhibits classic hallmarks of an online employment scam, advance-fee fraud, or credential harvesting."
    elif risk_points >= 20:
        overall_risk = "Medium"
        risk_color = "warning"
        risk_summary = "Several ambiguous or elevated warning signs detected. Key organizational credentials remain unverified. Exercise strong caution before proceeding."
    else:
        if positive_points >= 30:
            overall_risk = "Low"
            risk_color = "success"
            risk_summary = "Signals align with standard legitimate academic or corporate postings. No critical red flags detected in the submitted content."
        else:
            overall_risk = "Medium"
            risk_color = "warning"
            risk_summary = "Insufficient signals to verify legitimacy. While no blatant scam markers were found, several crucial credentials are missing."

    # Confidence calculation
    text_length = len(text.strip()) if text else 0
    if text_length > 300 and (url or len(text.strip()) > 600):
        confidence_score = 85
        confidence_text = "Substantial text provided; robust heuristic signal coverage."
    elif text_length > 120:
        confidence_score = 65
        confidence_text = "Moderate text sample analyzed; some institutional context remains missing."
    else:
        confidence_score = 40
        confidence_text = "Brief excerpt provided; automated analysis has limited visibility."

    return {
        "overall_risk": overall_risk,
        "risk_color": risk_color,
        "risk_summary": risk_summary,
        "risk_score": risk_points,
        "confidence_score": confidence_score,
        "confidence_text": confidence_text,
        "limitations": [
            "Analysis is based on heuristic textual matching and known pattern databases.",
            "TrustShield cannot inspect private email headers, server DNS logs, or private contracts.",
            "Automated results are guidance for your protection, not definitive legal determinations or safety guarantees."
        ],
        "claims": claims,
        "missing_info": missing_info,
        "actions": actions
    }


def match_safe_alternatives(opportunity_type, field="all"):
    """Match trusted safe platforms based on type and student field."""
    results = []
    field_lower = field.lower() if field else "all"
    type_lower = opportunity_type.lower() if opportunity_type else "all"

    for alt in SAFE_ALTERNATIVES:
        type_match = ("all" in alt["types"]) or (type_lower in alt["types"])
        field_match = ("all" in alt["fields"]) or (field_lower in alt["fields"])
        if type_match and field_match:
            results.append(alt)

    # If too few, include general platforms
    if len(results) < 3:
        for alt in SAFE_ALTERNATIVES:
            if alt not in results and ("all" in alt["fields"] or "all" in alt["types"]):
                results.append(alt)
                if len(results) >= 4:
                    break

    return results


class TrustShieldRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler serving static files and JSON REST APIs."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/samples":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(DEMO_SAMPLES).encode("utf-8"))
            return

        elif path == "/api/alternatives":
            query = urllib.parse.parse_qs(parsed.query)
            opp_type = query.get("type", ["all"])[0]
            field = query.get("field", ["all"])[0]
            matches = match_safe_alternatives(opp_type, field)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(matches).encode("utf-8"))
            return

        # Default static file handling
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/analyze":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)

            try:
                data = json.loads(post_body.decode("utf-8"))
                opp_type = data.get("opportunityType", "internship")
                text = data.get("content", "")
                url = data.get("url", "")
                field = data.get("field", "all")

                result = extract_claims_and_signals(opp_type, text, url)
                alternatives = match_safe_alternatives(opp_type, field)
                result["alternatives"] = alternatives

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()


def run(port=PORT):
    server_address = ("", port)
    # Allow port reuse quickly on restart
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(server_address, TrustShieldRequestHandler) as httpd:
        print(f"TrustShield Server running at http://localhost:{port}/")
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()


if __name__ == "__main__":
    PORT = 8000

    with socketserver.ThreadingTCPServer(
        ("127.0.0.1", PORT), TrustShieldRequestHandler
    ) as server:
        print(f"TrustShield running at http://127.0.0.1:{PORT}")
        server.serve_forever()
    
