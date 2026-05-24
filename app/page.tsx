import MacDock from "./components/MacDock";
import ProjectDesktop from "./components/ProjectDesktop";

export default function Home() {
  return (
    <main
      className="relative h-screen w-screen overflow-hidden bg-black text-white"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.16)), url("/image/port_backgounrd.png")',
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.03),rgba(0,0,0,0.03)_34%,rgba(0,0,0,0.42)_100%)]" />
      <div className="noise-sheet pointer-events-none absolute inset-0 z-0" />
      <ProjectDesktop />
      <MacDock />
    </main>
  );
}
