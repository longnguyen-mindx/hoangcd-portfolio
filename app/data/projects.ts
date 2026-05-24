export const projects = [
  { src: "/image/ai-generate.jpg", label: "AI Generate - Workflows", left: 8, top: 16, rotate: -2.4, appId: "aiWorkflows" },
  { src: "/image/cover-lighting.jpg", label: "Lighting & Context Set Up", left: 76, top: 13, rotate: 2.2, appId: "lighting" },
  { src: "/image/cover-video.png", label: "Video Creator", left: 14, top: 56, rotate: 1.5, appId: "videoCreator" },
  { src: "/image/cover-design.jpg", label: "Visual Design", left: 72, top: 56, rotate: -1.7, appId: "visualDesign" },
  { src: "/image/cover-multimedia.jpg", label: "Khóa học Multimedia (Coming Soon)", left: 84, top: 35, rotate: 0.9, appId: "multimedia" },
] as const;

export type Project = {
  src: string;
  label: string;
  left: number;
  top: number;
  rotate: number;
  appId?: string;
};
