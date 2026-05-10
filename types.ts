export interface SkillData {
  subject: string;
  userScore: number;
  requiredScore: number;
}

export interface SkillGapItem {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  learningTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  resourceLink: string;
}

export interface LearningResource {
  name: string;
  skillToAcquire: string;
  type: 'Video' | 'Course' | 'Documentation' | 'Quick Win';
  url: string;
  estimatedTime: string;
  rationale: string;
}

export interface ActionPlanWeek {
  week: number;
  focus: string;
  tasks: string[];
  resources: LearningResource[];
}

export interface MarketInsights {
  demandIntensity: number; // 0-100
  salaryRange: {
    min: string;
    max: string;
    currency: string;
  };
  marketSentiment: string;
  pivotRoles: string[];
}

export interface AlternativePath {
  role: string;
  rationale: string;
  synergyScore: number;
}

export interface ResearchSource {
  title: string;
  uri: string;
}

export interface CareerAnalysis {
  matchScore: number;
  readinessScore: number;
  badge: 'Excellent Match' | 'Good Match' | 'Needs Work' | 'Skill Gap';
  experience: {
    detected: number;
    required: number;
    description: string;
  };
  education: {
    detected: string[];
    verified: boolean;
    status: string;
  };
  radarData: SkillData[];
  strongSkills: { name: string; level: number }[];
  skillsGap: SkillGapItem[];
  jobReadiness: {
    progress: number;
    estimatedMonths: number;
  };
  actionPlan: ActionPlanWeek[];
  priorityLearningPath: string[];
  marketInsights: MarketInsights;
  alternativePaths: AlternativePath[];
  sources: ResearchSource[];
}

export type ModuleStatus = 'locked' | 'in-progress' | 'completed';

export interface ClarityModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  category: 'Self-Assessment' | 'Market Research' | 'Decision Making' | 'Implementation';
}

export enum CareerRole {
  DATA_SCIENTIST = 'Data Scientist',
  DATA_ANALYST = 'Data Analyst',
  SOFTWARE_ENGINEER = 'Software Engineer',
  UNIVERSITY_PROFESSOR = 'University Professor',
  ADVOCATE_LEGAL = 'Advocate / Lawyer',
  BUSINESS_ANALYST = 'Business Analyst',
  CIVIL_SERVICE_OFFICER = 'Civil Service Officer (IAS/IPS/IFS)',
  PSU_MANAGEMENT_TRAINEE = 'Management Trainee (PSU Sector)',
  GOVT_ENGINEER = 'Junior/Senior Engineer (Govt Dept)',
  DEFENSE_SCIENTIST = 'Defense Scientist (DRDO)',
  SPACE_SCIENTIST = 'Space Scientist (ISRO)',
  BANKING_OFFICER = 'Probationary Officer (Public Sector Bank)',
  POLICY_ANALYST_GOVT = 'Policy Analyst (Govt Think Tank)',
  PUBLIC_PROSECUTOR = 'Public Prosecutor',
  TAX_OFFICER = 'Income Tax / Revenue Officer',
  URBAN_PLANNER_GOVT = 'Municipal Urban Planner',
  CUSTOMS_OFFICER = 'Customs & Excise Officer',
  POSTAL_MANAGER = 'Postal Service Manager',
  DISASTER_MGMT_OFFICER = 'Disaster Management Specialist',
  RAILWAY_OFFICER = 'Railway Administrative Officer',
  FOREST_OFFICER = 'Forest Service Range Officer',
  INTELLIGENCE_OFFICER = 'Intelligence Officer (IB/RAW)',
  CENSUS_OFFICER = 'Census Data Analyst',
  PORT_DIRECTOR = 'Port Trust Officer',
  LABOR_COMMISSIONER = 'Assistant Labor Commissioner',
  PUBLIC_RELATIONS_GOVT = 'Government PRO',
  PRIMARY_SCHOOL_TEACHER = 'Primary School Teacher',
  MIDDLE_SCHOOL_TEACHER = 'Middle School Teacher',
  HIGH_SCHOOL_TEACHER = 'High School Teacher'
}