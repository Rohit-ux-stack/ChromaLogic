import { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  onSnapshot, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import type { 
  PortfolioData, 
  ProfileData, 
  ProjectData, 
  DesignData,
  VideoData, 
  SocialData, 
  ResumeData 
} from '../types';

export function usePortfolioData(): PortfolioData {
  const [data, setData] = useState<PortfolioData>({
    profile: null,
    projects: [],
    designs: [],
    videos: [],
    socials: [],
    resume: null,
    loading: true,
  });

  useEffect(() => {
    const contentRef = collection(db, 'content');
    
    const unsubscribe = onSnapshot(
      contentRef,
      (snapshot) => {
        let profile: ProfileData | null = null;
        const projects: ProjectData[] = [];
        const designs: DesignData[] = [];
        const videos: VideoData[] = [];
        const socials: SocialData[] = [];
        let resume: ResumeData | null = null;

        snapshot.forEach((docSnap) => {
          const docData = docSnap.data();
          const docId = docSnap.id;
          const type = docData.type;

          // Strictly ignore any test/dummy/probe documents
          if (
            docId === 'test-connection' ||
            docId.startsWith('test-') ||
            docData.isTest ||
            docData.isDummy
          ) {
            return;
          }

          if (type === 'profile') {
            profile = {
              id: docId,
              type: 'profile',
              name: docData.name || '',
              tagline: docData.tagline || '',
              bio: docData.bio || '',
              photoUrl: docData.photoUrl || '',
              email: docData.email || '',
              location: docData.location || '',
              skills: docData.skills || '',
              updatedAt: docData.updatedAt || '',
              // Custom Stats Bar Fields
              stat1Title: docData.stat1Title || '',
              stat1Desc: docData.stat1Desc || '',
              stat2Title: docData.stat2Title || '',
              stat2Desc: docData.stat2Desc || '',
              stat3Title: docData.stat3Title || '',
              stat3Desc: docData.stat3Desc || '',
            };
          } else if (type === 'project') {
            projects.push({
              id: docId,
              type: 'project',
              title: docData.title || '',
              description: docData.description || '',
              imageUrl: docData.imageUrl || '',
              images: Array.isArray(docData.images) ? docData.images : [],
              techStack: docData.techStack || '',
              purpose: docData.purpose || '',
              story: docData.story || '',
              howItWorks: docData.howItWorks || '',
              githubUrl: docData.githubUrl || '',
              youtubeUrl: docData.youtubeUrl || '',
              order: typeof docData.order === 'number' ? docData.order : 0,
              createdAt: docData.createdAt || '',
            });
          } else if (type === 'design') {
            designs.push({
              id: docId,
              type: 'design',
              title: docData.title || '',
              category: docData.category || 'Graphic Design',
              description: docData.description || '',
              imageUrl: docData.imageUrl || '',
              images: Array.isArray(docData.images) ? docData.images : [],
              clientOrTool: docData.clientOrTool || '',
              projectUrl: docData.projectUrl || '',
              order: typeof docData.order === 'number' ? docData.order : 0,
              createdAt: docData.createdAt || '',
            });
          } else if (type === 'video') {
            videos.push({
              id: docId,
              type: 'video',
              title: docData.title || '',
              youtubeUrl: docData.youtubeUrl || '',
              order: typeof docData.order === 'number' ? docData.order : 0,
              createdAt: docData.createdAt || '',
            });
          } else if (type === 'social') {
            socials.push({
              id: docId,
              type: 'social',
              socialPlatform: docData.socialPlatform || 'Other',
              socialUrl: docData.socialUrl || '',
              order: typeof docData.order === 'number' ? docData.order : 0,
              createdAt: docData.createdAt || '',
            });
          } else if (type === 'resume') {
            resume = {
              id: docId,
              type: 'resume',
              resumeUrl: docData.resumeUrl || '',
              createdAt: docData.createdAt || '',
            };
          }
        });

        // Sort by order ascending
        projects.sort((a, b) => a.order - b.order);
        designs.sort((a, b) => a.order - b.order);
        videos.sort((a, b) => a.order - b.order);
        socials.sort((a, b) => a.order - b.order);

        setData({
          profile,
          projects,
          designs,
          videos,
          socials,
          resume,
          loading: false,
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'content');
        setData((prev) => ({ ...prev, loading: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  return data;
}
