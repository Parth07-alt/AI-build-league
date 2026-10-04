const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

function generateReferralCode(name) {
  const namePart = name.split(' ')[0].toUpperCase().slice(0, 6);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}-${randomPart}`;
}

function seed() {
  console.log('🌱 Seeding AI Build League database...');

  // Clear all existing data
  db.exec(`
    DELETE FROM project_votes;
    DELETE FROM shares;
    DELETE FROM project_progress;
    DELETE FROM attendance;
    DELETE FROM referrals;
    DELETE FROM squad_members;
    DELETE FROM squads;
    DELETE FROM registrations;
    DELETE FROM students;
    DELETE FROM clubs;
    DELETE FROM colleges;
    DELETE FROM projects;
    DELETE FROM experiments;
    DELETE FROM budget_items;
    DELETE FROM campaign_events;
  `);

  // Colleges
  const colleges = [
    { id: uuidv4(), name: 'Ramaiah Institute of Technology', city: 'Bangalore' },
    { id: uuidv4(), name: 'RVCE', city: 'Bangalore' },
    { id: uuidv4(), name: 'PES University', city: 'Bangalore' },
    { id: uuidv4(), name: 'BMSCE', city: 'Bangalore' },
    { id: uuidv4(), name: 'BIT Mesra', city: 'Ranchi' },
    { id: uuidv4(), name: 'DSCE', city: 'Bangalore' },
    { id: uuidv4(), name: 'NIE Mysore', city: 'Mysore' },
    { id: uuidv4(), name: 'SIT Tumkur', city: 'Tumkur' },
    { id: uuidv4(), name: 'SJBIT Bangalore', city: 'Bangalore' },
    { id: uuidv4(), name: 'CMRIT Bangalore', city: 'Bangalore' },
  ];

  const insertCollege = db.prepare('INSERT INTO colleges (id, name, city, demo_flag) VALUES (?, ?, ?, 1)');
  colleges.forEach(c => insertCollege.run(c.id, c.name, c.city));

  // Clubs (3 per college)
  const clubNames = ['Coding Club', 'AI/ML Club', 'IEEE Student Branch', 'E-Cell', 'Developer Student Club', 'Robotics Club', 'Tech Club', 'Data Science Club'];
  const clubs = [];
  const insertClub = db.prepare('INSERT INTO clubs (id, name, college_id, demo_flag) VALUES (?, ?, ?, 1)');

  colleges.forEach((college, ci) => {
    for (let i = 0; i < 3; i++) {
      const club = {
        id: uuidv4(),
        name: clubNames[(ci * 3 + i) % clubNames.length],
        college_id: college.id
      };
      clubs.push(club);
      insertClub.run(club.id, club.name, club.college_id);
    }
  });

  // Projects
  const projects = [
    {
      id: uuidv4(),
      name: 'AI Resume Analyzer',
      description: 'Analyze a resume and receive AI-powered improvement suggestions tailored for tech roles.',
      difficulty: 'Beginner',
      estimated_minutes: 60,
      skills: 'GenAI,Prompt Engineering,Python,APIs'
    },
    {
      id: uuidv4(),
      name: 'College FAQ Bot',
      description: 'Build a conversational bot that answers college-specific FAQs using GenAI.',
      difficulty: 'Beginner',
      estimated_minutes: 60,
      skills: 'GenAI,Chatbots,JavaScript,APIs'
    },
    {
      id: uuidv4(),
      name: 'AI Study Assistant',
      description: 'Create an AI assistant that generates summaries, quizzes, and study plans from notes.',
      difficulty: 'Intermediate',
      estimated_minutes: 60,
      skills: 'GenAI,NLP,Python,Prompt Engineering'
    },
    {
      id: uuidv4(),
      name: 'AI Expense Analyzer',
      description: 'Upload expense data and get AI-powered spending insights and budget recommendations.',
      difficulty: 'Intermediate',
      estimated_minutes: 60,
      skills: 'GenAI,Data Analysis,Python,Visualization'
    },
    {
      id: uuidv4(),
      name: 'Customer Support Assistant',
      description: 'Build a GenAI-powered customer support bot with custom knowledge base integration.',
      difficulty: 'Intermediate',
      estimated_minutes: 60,
      skills: 'GenAI,RAG,APIs,JavaScript'
    },
  ];

  const insertProject = db.prepare('INSERT INTO projects (id, name, description, difficulty, estimated_minutes, skills) VALUES (?, ?, ?, ?, ?, ?)');
  projects.forEach(p => insertProject.run(p.id, p.name, p.description, p.difficulty, p.estimated_minutes, p.skills));

  // Students (300 total across colleges)
  const firstNames = ['Rahul', 'Priya', 'Arjun', 'Neha', 'Karthik', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Divya',
    'Aditya', 'Pooja', 'Akash', 'Shreya', 'Nikhil', 'Kavya', 'Siddharth', 'Meera', 'Pranav', 'Nandini',
    'Harsh', 'Tanya', 'Varun', 'Swathi', 'Gaurav', 'Riya', 'Deepak', 'Ananya', 'Suresh', 'Pallavi',
    'Manish', 'Kritika', 'Rajesh', 'Ishita', 'Amrit', 'Sakshi', 'Vignesh', 'Rupali', 'Gopal', 'Ankita'];
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Nair', 'Iyer', 'Verma', 'Rao', 'Gupta',
    'Joshi', 'Mehta', 'Pillai', 'Bhat', 'Naik', 'Hegde', 'Gowda', 'Murthy', 'Kulkarni', 'Desai'];
  const branches = ['Computer Science', 'Information Science', 'Electronics', 'Mechanical', 'Civil'];
  const sources = ['student_club', 'whatsapp', 'linkedin', 'referral', 'campus_link', 'organic', 'instagram'];

  const students = [];
  const insertStudent = db.prepare(`
    INSERT INTO students (id, name, email, branch, graduation_year, college_id, club_id, project_id, referral_code, referred_by, source, medium, campaign, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Distribution of students across colleges: RIT gets most (83), RVCE (91 - top), PES (64), others less
  const collegeCounts = [83, 91, 64, 52, 31, 28, 22, 18, 15, 12];

  let studentIndex = 0;
  colleges.forEach((college, ci) => {
    const count = collegeCounts[ci] || 10;
    const collegeClubs = clubs.filter(c => c.college_id === college.id);

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentIndex}@${college.name.replace(/\s+/g, '').toLowerCase()}.edu`;
      const branch = branches[Math.floor(Math.random() * branches.length)];
      const club = collegeClubs[Math.floor(Math.random() * collegeClubs.length)];
      const project = projects[Math.floor(Math.random() * projects.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const referralCode = generateReferralCode(name);
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000)).toISOString();

      const student = {
        id: uuidv4(),
        name,
        email,
        branch,
        graduation_year: 2025,
        college_id: college.id,
        club_id: club.id,
        project_id: project.id,
        referral_code: referralCode,
        referred_by: null,
        source,
        medium: source === 'whatsapp' ? 'whatsapp' : source === 'linkedin' ? 'linkedin' : 'direct',
        campaign: 'ai-build-league',
        created_at: createdAt
      };
      students.push(student);
      insertStudent.run(
        student.id, student.name, student.email, student.branch,
        student.graduation_year, student.college_id, student.club_id, student.project_id,
        student.referral_code, student.referred_by, student.source, student.medium,
        student.campaign, student.created_at
      );
      studentIndex++;
    }
  });

  // Registrations (all students)
  const insertRegistration = db.prepare('INSERT INTO registrations (id, student_id, registered_at, status) VALUES (?, ?, ?, ?)');
  students.forEach(s => {
    insertRegistration.run(uuidv4(), s.id, s.created_at, 'registered');
  });

  // Referrals (some students referred by others)
  const insertReferral = db.prepare('INSERT INTO referrals (id, referrer_student_id, referred_student_id, created_at) VALUES (?, ?, ?, ?)');
  let referralCount = 0;
  students.forEach((student, i) => {
    if (i > 20 && Math.random() < 0.12) {
      const referrer = students[Math.floor(Math.random() * Math.min(i, students.length))];
      if (referrer.id !== student.id) {
        try {
          insertReferral.run(uuidv4(), referrer.id, student.id, student.created_at);
          referralCount++;
        } catch (e) {}
      }
    }
  });

  // Attendance (70% of students attended)
  const insertAttendance = db.prepare('INSERT INTO attendance (id, student_id, attended, attended_at) VALUES (?, ?, ?, ?)');
  students.forEach(s => {
    const attended = Math.random() < 0.70 ? 1 : 0;
    const attendedAt = attended ? new Date(Date.now() - Math.floor(Math.random() * 3 * 86400000)).toISOString() : null;
    insertAttendance.run(uuidv4(), s.id, attended, attendedAt);
  });

  // Project progress (80% of attendees started, 75% of starters completed)
  const insertProgress = db.prepare('INSERT INTO project_progress (id, student_id, started, completed, completion_time, completed_at) VALUES (?, ?, ?, ?, ?, ?)');
  students.forEach(s => {
    const att = db.prepare('SELECT attended FROM attendance WHERE student_id = ?').get(s.id);
    if (att && att.attended) {
      const started = Math.random() < 0.80 ? 1 : 0;
      const completed = started && Math.random() < 0.75 ? 1 : 0;
      const completionTime = completed ? Math.floor(45 + Math.random() * 20) : null;
      const completedAt = completed ? new Date(Date.now() - Math.floor(Math.random() * 2 * 86400000)).toISOString() : null;
      insertProgress.run(uuidv4(), s.id, started, completed, completionTime, completedAt);
    } else {
      insertProgress.run(uuidv4(), s.id, 0, 0, null, null);
    }
  });

  // Shares
  const platforms = ['linkedin', 'whatsapp', 'twitter', 'instagram'];
  const insertShare = db.prepare('INSERT INTO shares (id, student_id, platform, created_at) VALUES (?, ?, ?, ?)');
  students.forEach(s => {
    const prog = db.prepare('SELECT completed FROM project_progress WHERE student_id = ?').get(s.id);
    if (prog && prog.completed && Math.random() < 0.60) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      insertShare.run(uuidv4(), s.id, platform, new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString());
    }
  });

  // Squads
  const squadNames = ['AI Avengers', 'Code Crusaders', 'Neural Ninjas', 'Build Squad', 'Prompt Masters', 'GenAI Gang', 'Tech Titans', 'Debug Dragons'];
  const insertSquad = db.prepare('INSERT INTO squads (id, name, college_id, created_by, created_at) VALUES (?, ?, ?, ?, ?)');
  const insertSquadMember = db.prepare('INSERT INTO squad_members (id, squad_id, student_id, joined_at) VALUES (?, ?, ?, ?)');

  colleges.forEach((college, ci) => {
    const collegeStudents = students.filter(s => s.college_id === college.id);
    const numSquads = Math.min(3, Math.floor(collegeStudents.length / 4));
    for (let i = 0; i < numSquads; i++) {
      const squadId = uuidv4();
      const creator = collegeStudents[i * 4];
      if (!creator) continue;
      const squadName = `${college.name.split(' ')[0]} ${squadNames[i % squadNames.length]}`;
      insertSquad.run(squadId, squadName, college.id, creator.id, new Date().toISOString());
      const members = collegeStudents.slice(i * 4, i * 4 + 4);
      members.forEach(m => {
        try {
          insertSquadMember.run(uuidv4(), squadId, m.id, new Date().toISOString());
        } catch (e) {}
      });
    }
  });

  // Votes (for project wall)
  const completedStudents = students.filter(s => {
    const prog = db.prepare('SELECT completed FROM project_progress WHERE student_id = ?').get(s.id);
    return prog && prog.completed;
  });
  const insertVote = db.prepare('INSERT INTO project_votes (id, student_id, voter_identifier, created_at) VALUES (?, ?, ?, ?)');
  completedStudents.forEach(s => {
    const voteCount = Math.floor(Math.random() * 50);
    for (let v = 0; v < voteCount; v++) {
      try {
        insertVote.run(uuidv4(), s.id, `voter_${v}_${s.id}`, new Date().toISOString());
      } catch (e) {}
    }
  });

  // Experiments
  const insertExp = db.prepare('INSERT INTO experiments (id, name, hypothesis, variant_a, variant_b, metric, status, sample_size, result, decision) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const experiments = [
    {
      id: uuidv4(),
      name: 'Message Framing Test',
      hypothesis: 'Career-outcome framing will outperform generic activity framing for registration conversion.',
      variant_a: 'Build Your First AI Project in 60 Minutes.',
      variant_b: 'Add Your First AI Project to Your Resume in 60 Minutes.',
      metric: 'Registration conversion rate',
      status: 'completed',
      sample_size: 480,
      result: 'Variant B: 8.4% conversion vs Variant A: 5.2%. Variant B wins by 62%.',
      decision: 'Adopt Variant B as primary headline.'
    },
    {
      id: uuidv4(),
      name: 'Campus Competition vs Individual Referral',
      hypothesis: 'Campus competition will generate more sustained distribution than individual referral incentives.',
      variant_a: 'Individual referral with small reward',
      variant_b: 'Campus leaderboard competition',
      metric: 'Registrations per participating community',
      status: 'running',
      sample_size: 240,
      result: 'Preliminary: Campus competition showing 3.2x more registrations per community.',
      decision: null
    },
    {
      id: uuidv4(),
      name: 'Distribution Channel Test',
      hypothesis: 'Student club WhatsApp groups will outperform cold WhatsApp communities for cost-per-registration.',
      variant_a: 'WhatsApp community broadcast',
      variant_b: 'Student club WhatsApp group',
      metric: 'Registrations per outreach message',
      status: 'completed',
      sample_size: 320,
      result: 'Club groups: 12.3 registrations per message. Communities: 2.1 registrations. Club groups win by 5.9x.',
      decision: 'Prioritize club group distribution over cold communities.'
    },
    {
      id: uuidv4(),
      name: 'Workshop Positioning Test',
      hypothesis: '"Build" framing outperforms "Free" framing for click-through among placement-focused students.',
      variant_a: 'Free AI Workshop — Register Now',
      variant_b: 'Build Your First AI Project — 60 Minutes',
      metric: 'Click-through rate on club messages',
      status: 'completed',
      sample_size: 600,
      result: 'Variant B CTR: 14.2% vs Variant A: 6.8%. Build framing wins decisively.',
      decision: 'All materials use "build" framing. "Free" used only as secondary qualifier.'
    },
    {
      id: uuidv4(),
      name: 'Reminder Personalization Test',
      hypothesis: 'Project-specific reminders will increase attendance rate vs generic reminders.',
      variant_a: 'Reminder: AI workshop tomorrow at 7PM.',
      variant_b: 'Tomorrow you\'ll build an AI Resume Analyzer. Bring your resume — see you at 7PM.',
      metric: 'Day-of attendance rate',
      status: 'running',
      sample_size: 180,
      result: 'In progress. Early data shows Variant B +18% attendance.',
      decision: null
    },
  ];
  experiments.forEach(e => insertExp.run(e.id, e.name, e.hypothesis, e.variant_a, e.variant_b, e.metric, e.status, e.sample_size, e.result, e.decision));

  // Budget items
  const insertBudget = db.prepare('INSERT INTO budget_items (id, name, amount, category, description) VALUES (?, ?, ?, ?, ?)');
  const budgetItems = [
    { id: uuidv4(), name: 'Winning Campus Reward', amount: 800, category: 'reward', description: 'Reward for #1 ranked campus by Growth Score. Distributed to club/student organizers.' },
    { id: uuidv4(), name: 'Winning Club Reward', amount: 600, category: 'reward', description: 'Reward for #1 ranked club by Growth Score. Activates distribution motivation.' },
    { id: uuidv4(), name: 'Top Student Builder Award', amount: 300, category: 'reward', description: 'Individual recognition for highest-rated project on the AI Project Wall.' },
    { id: uuidv4(), name: 'Most Improved Campus Award', amount: 300, category: 'reward', description: 'Prevents only large colleges from dominating. Rewards fastest-growing smaller campus.' },
  ];
  budgetItems.forEach(b => insertBudget.run(b.id, b.name, b.amount, b.category, b.description));

  const totalStudents = students.length;
  console.log(`✅ Seeded successfully:`);
  console.log(`   ${colleges.length} colleges`);
  console.log(`   ${clubs.length} clubs`);
  console.log(`   ${projects.length} projects`);
  console.log(`   ${totalStudents} students`);
  console.log(`   ${referralCount} referrals`);
  console.log(`   ${experiments.length} experiments`);
  console.log(`   ${budgetItems.length} budget items`);
}

seed();
