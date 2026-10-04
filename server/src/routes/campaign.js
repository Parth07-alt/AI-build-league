const express = require('express');
const router = express.Router();

// POST /api/campaign/kit - generate campaign kit
router.post('/kit', (req, res) => {
  const { college_name, club_name, club_id } = req.body;

  if (!college_name || !club_name) {
    return res.status(400).json({ error: 'College and club names are required.' });
  }

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const clubLink = `${baseUrl}/join?club=${encodeURIComponent(club_id || club_name)}&utm_source=club&utm_medium=whatsapp&utm_campaign=ai-build-league`;
  const collegeName = college_name;
  const clubNameShort = club_name;

  const kit = {
    club_link: clubLink,
    whatsapp_message: `🚀 *${collegeName} ${clubNameShort} is joining the AI Build League!*

Build your first AI project in just 60 minutes.

🏆 Help ${collegeName} climb the campus leaderboard.

What you'll get:
✅ Working AI project for your resume
✅ AI Project Passport (shareable)
✅ Campus competition glory

🎯 Register FREE here:
${clubLink}

Use code: ABL2025 | Limited spots!

#AIBuildLeague #BuiltIn60 #AIProjects`,

    instagram_caption: `🤖 ${collegeName} students — this is your moment.

Build your first AI project in 60 minutes at the AI Build League Workshop.

Not a theory class. Not slides. An actual working project.

🏆 Campus leaderboard. Real competition. Real builds.

📲 Link in bio to register FREE

#AIBuildLeague #BuiltIn60 #AIProjects #Engineering #PlacementReady #GenAI #${collegeName.replace(/\s+/g, '')}`,

    instagram_story: `📣 ${collegeName} ${clubNameShort} presents:

🤖 AI BUILD LEAGUE

Build. Compete. Showcase.

60 minutes → 1 working AI project

🔗 LINK IN BIO → Register FREE

Swipe up to join!`,

    linkedin_post: `Exciting news for ${collegeName} students! 🎓

${clubNameShort} is partnering with the AI Build League — a campus-wide challenge where engineering students build their first AI project in 60 minutes.

Why this matters for placements:
→ Practical GenAI experience
→ A real project for your resume/GitHub
→ Shareable AI Project Passport
→ Campus community recognition

This is one of the fastest ways to go from "I want to learn AI" to "I built an AI project."

Free. Online. 60 minutes.

Register: ${clubLink}

#AIBuildLeague #GenAI #EngineeringStudents #Placements`,

    personal_invite: `Hey! 👋

I'm inviting you to the AI Build League — we're building our first AI project together in 60 minutes.

It's free, it's online, and you walk away with a real project for your resume.

Our ${clubNameShort} is competing on the campus leaderboard, so the more of us who join, the better we do!

Join here: ${clubLink}

See you there! 🚀`,
  };

  res.json(kit);
});

module.exports = router;
