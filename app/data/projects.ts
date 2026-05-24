export const projects = [
  { src: "/image/project-a.jpg", label: "Project Video (Linh vuc A)", left: 8, top: 16, rotate: -2.4 },
  { src: "/image/project-b.jpg", label: "Brand System (Linh vuc B)", left: 76, top: 13, rotate: 2.2 },
  { src: "/image/project-c.jpg", label: "Editorial Portraits", left: 14, top: 56, rotate: 1.5 },
  { src: "/image/project-d.jpg", label: "Motion Archive", left: 72, top: 56, rotate: -1.7 },
  { src: "/image/project-a.jpg", label: "Studio Notes", left: 84, top: 35, rotate: 0.9 },
] as const;

export type Project = (typeof projects)[number];
