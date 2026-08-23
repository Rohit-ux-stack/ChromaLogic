export type SocialPlatform = 'GitHub' | 'LinkedIn' | 'YouTube' | 'Instagram' | 'Twitter/X' | 'Other';

export interface ProfileData {
  id?: string;
  type: 'profile';
  name?: string;
  tagline?: string;
  bio?: string;
  photoUrl?: string;
  ogBannerUrl?: string;
  email?: string;
  location?: string;
  skills?: string;
  updatedAt?: string;
}

export interface ProjectData {
  id: string;
  type: 'project';
  title: string;
  description: string;
  imageUrl?: string;
  githubUrl: string;
  youtubeUrl?: string;
  order: number;
  createdAt?: string;
}

export interface DesignData {
  id: string;
  type: 'design';
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  clientOrTool?: string;
  projectUrl?: string;
  order: number;
  createdAt?: string;
}

export interface VideoData {
  id: string;
  type: 'video';
  title: string;
  youtubeUrl: string;
  order: number;
  createdAt?: string;
}

export interface SocialData {
  id: string;
  type: 'social';
  socialPlatform: SocialPlatform;
  socialUrl: string;
  order: number;
  createdAt?: string;
}

export interface ResumeData {
  id?: string;
  type: 'resume';
  resumeUrl: string;
  createdAt?: string;
}

export interface PortfolioData {
  profile: ProfileData | null;
  projects: ProjectData[];
  designs: DesignData[];
  videos: VideoData[];
  socials: SocialData[];
  resume: ResumeData | null;
  loading: boolean;
}

