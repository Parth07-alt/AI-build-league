import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Students
export const getAllStudents = () => api.get('/students');
export const registerStudent = (data: any) => api.post('/students/register', data);
export const getStudent = (id: string) => api.get(`/students/${id}`);
export const getStudentByEmail = (email: string) => api.get(`/students/by-email/${encodeURIComponent(email)}`);
export const getStudentReferrals = (id: string) => api.get(`/students/${id}/referral`);

// Colleges
export const getColleges = () => api.get('/colleges');
export const getCollege = (id: string) => api.get(`/colleges/${id}`);

// Clubs
export const getClubs = (collegeId?: string) => api.get('/clubs', { params: { collegeId } });
export const getClub = (id: string) => api.get(`/clubs/${id}`);

// Projects
export const getProjects = () => api.get('/projects');
export const getProject = (id: string) => api.get(`/projects/${id}`);
export const getProjectWall = (params?: any) => api.get('/projects/wall/all', { params });
export const getPassport = (studentId: string) => api.get(`/projects/${studentId}/passport`);
export const voteForProject = (studentId: string, voter_identifier: string) =>
  api.post(`/projects/${studentId}/vote`, { voter_identifier });
export const shareProject = (studentId: string, platform: string) =>
  api.post(`/projects/${studentId}/share`, { platform });

// Leaderboard
export const getCollegeLeaderboard = () => api.get('/leaderboard/colleges');
export const getClubLeaderboard = () => api.get('/leaderboard/clubs');
export const getStudentLeaderboard = () => api.get('/leaderboard/students');
export const getSquadLeaderboard = () => api.get('/leaderboard/squads');

// Dashboard (Admin)
export const getDashboardOverview = () => api.get('/dashboard/overview');
export const getDashboardFunnel = () => api.get('/dashboard/funnel');
export const getDashboardChannels = () => api.get('/dashboard/channels');
export const getDashboardProjects = () => api.get('/dashboard/projects');
export const getDashboardColleges = () => api.get('/dashboard/colleges');
export const getDashboardClubs = () => api.get('/dashboard/clubs');
export const getDashboardReferrals = () => api.get('/dashboard/referrals');
export const getDashboardDaily = () => api.get('/dashboard/daily');

// Squads
export const createSquad = (data: any) => api.post('/squads', data);
export const joinSquad = (id: string, student_id: string) => api.post(`/squads/${id}/join`, { student_id });
export const getSquad = (id: string) => api.get(`/squads/${id}`);
export const getSquads = (college_id?: string) => api.get('/squads', { params: { college_id } });

// Experiments
export const getExperiments = () => api.get('/experiments');

// Budget
export const getBudget = () => api.get('/budget');

// Referrals
export const validateReferral = (code: string) => api.get(`/referrals/validate/${code}`);

// Campaign Kit
export const generateCampaignKit = (data: any) => api.post('/campaign/kit', data);

export default api;
