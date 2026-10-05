# AI + Learning Notes: The AI Build League Strategy

### Example 1 — From Broad Channels to Focused Distribution

**What I asked AI:**  
I asked AI, "How can I get 500 final-year engineering students to register for an AI workshop in 7 days with a ₹2,000 budget?"

**What AI suggested:**  
AI suggested a broad, multi-channel marketing strategy involving social media, influencers, email marketing, WhatsApp blasts, paid ads, and student clubs. 

**What I changed/rejected:**  
I rejected the multi-channel approach and chose to focus entirely on one high-leverage distribution mechanism: **Student clubs + campus communities + peer referrals**. 

**Why:**  
The constraint of ₹2,000 and 7 days made a multi-channel approach unviable. Executing 10+ channels would spread the effort too thin. I wanted a low-cost, scalable distribution layer, so I decided to leverage existing student communities rather than trying to build audience reach from scratch through paid ads.

**What I learned:**  
Growth is not about generating the maximum number of ideas. It is about choosing the fewest mechanisms that can realistically work under the constraints.

---

### Example 2 — Individual Referral Rewards vs. Community Competition

**What I asked AI:**  
I asked AI how to increase referrals after students register for the workshop.

**What AI suggested:**  
AI suggested a standard individual referral system: "Refer friends and receive a ₹50 cash reward."

**What I changed/rejected:**  
I rejected making individual cash payouts the primary referral mechanism. Instead, I designed a **Campus and Club Competition** where registrations contribute to a campus "Growth Score" on a public leaderboard. I proposed allocating the ₹2,000 budget entirely to community prizes (e.g., ₹800 to the Winning Campus, ₹600 to the Winning Club).

**Why:**  
With only ₹2,000, paying out individual rewards would quickly drain the budget without creating a strong network effect. A campus leaderboard introduces a new motivation—peer pressure and college pride. Framing it as "Help your campus build the biggest AI cohort" encourages students to distribute the link organically on our behalf. 

**What I learned:**  
The incentive does not always have to reward the individual. Sometimes rewarding the community can create a stronger and cheaper distribution mechanism.

---

### Example 3 — Landing Page vs. Growth Loop

**What I asked AI:**  
I asked AI what working asset I should build to support the campaign.

**What AI suggested:**  
AI suggested building a straightforward workshop landing page with a registration form and a referral tracker.

**What I changed/rejected:**  
I decided not to build *just* a landing page. Instead, I built the complete **AI Build League prototype**, a system connecting: Club acquisition ➔ Registration ➔ Campus Competition ➔ Project Passport ➔ Social Sharing ➔ Referral ➔ Admin Analytics.

**Why:**  
A landing page only solves the first step (Visit ➔ Register). I wanted to solve the larger growth problem: How can one registered student reliably create the next registration? The prototype I built acts as the infrastructure to automate this loop. By giving students a shareable "Project Passport" and clubs an automated "Campaign Kit," the asset directly facilitates the growth mechanics.

**What I learned:**  
The best working asset is not necessarily the most visually impressive marketing page. It should be the infrastructure that makes the growth mechanism easier to execute, measure, and repeat.

---

### Example 4 — Naming the Growth Loop: Generic Flow vs. Precise Flow

**What I asked AI:**  
I asked AI to visualize the growth loop for the AI Build League campaign as a simple flow diagram.

**What AI suggested (Flow v1 — Screenshot 1):**  
AI produced a generic, high-level flow:

```
CLUB
  ↓
CAMPAIGN KIT
  ↓
REGISTRATION
  ↓
CAMPUS COMPETITION
  ↓
PROJECT
  ↓
PROJECT PASSPORT
  ↓
SHARE
  ↓
REFERRAL
  ↓
NEW REGISTRATION
```

**What I changed/rejected:**  
I refined the node labels to be more precise and operationally specific, producing a second version:

```
STUDENT CLUBS
  ↓
CAMPAIGN KIT
  ↓
CLUB-SPECIFIC LINK
  ↓
STUDENT REGISTRATION
  ↓
CAMPUS COMPETITION
  ↓
PROJECT
  ↓
PROJECT PASSPORT
  ↓
SHARE
  ↓
REFERRAL
```

**Why:**  
The first flow was accurate at a conceptual level, but the labels were too generic to serve as a working blueprint. Replacing "CLUB" with "STUDENT CLUBS", "REGISTRATION" with "STUDENT REGISTRATION", and adding "CLUB-SPECIFIC LINK" as an explicit step makes it clear that tracking is built into the loop. The club-specific link is not just a distribution tool — it's the attribution mechanism that powers the leaderboard competition. Naming it explicitly ensures it is treated as a first-class feature, not an afterthought.

**What I learned:**  
A growth loop diagram is only useful if the labels are precise enough to directly map to buildable features. Vague node names like "CLUB" or "REGISTRATION" can hide critical implementation steps. The act of renaming nodes forced me to clarify the exact sequence of how value and attribution flow through the system.

---

### Final Reflection

I used AI to generate options and challenge my thinking, but I did not treat its first answer as the final answer. The important part of the process was applying the actual constraints—₹2,000, 7 days, and 500 registrations—and choosing what to reject. That process of elimination and constraint-based judgment led me away from a generic workshop campaign and directly into designing the AI Build League growth loop.
