import DraggableProjectIcon from "./DraggableProjectIcon";
import { projects } from "../data/projects";

export default function ProjectDesktop() {
  return (
    <section className="absolute inset-0 z-10" aria-label="Project desktop">
      {projects.map((project) => (
        <DraggableProjectIcon key={project.label} project={project} />
      ))}
    </section>
  );
}
