"use client";

import { useEffect, useRef, useState } from "react";
import { aboutStats, dockSocials, noteFolders, notePreviews } from "../data/dock";

type AppId = "about" | "notes" | "aiWorkflows" | "lighting" | "videoCreator" | "visualDesign" | "multimedia";

type WindowState = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  closing: boolean;
  x: number;
  y: number;
};

type WindowShellProps = {
  title: string;
  state: WindowState;
  width?: number;
  height?: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
  children: React.ReactNode;
};

type AppWindowProps = Omit<WindowShellProps, "title" | "children" | "width" | "height">;

type DockIconProps = {
  label: string;
  imageSrc: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  imageClassName?: string;
  onClick?: () => void;
};

const CLOSE_ANIMATION_MS = 180;
const WINDOW_MARGIN = 12;
const DOCK_SAFE_AREA = 92;

const defaultWindows: Record<AppId, WindowState> = {
  about: { open: false, minimized: false, maximized: false, closing: false, x: 80, y: 72 },
  notes: { open: false, minimized: false, maximized: false, closing: false, x: 360, y: 86 },
  aiWorkflows: { open: false, minimized: false, maximized: false, closing: false, x: 140, y: 60 },
  lighting: { open: false, minimized: false, maximized: false, closing: false, x: 180, y: 80 },
  videoCreator: { open: false, minimized: false, maximized: false, closing: false, x: 200, y: 70 },
  visualDesign: { open: false, minimized: false, maximized: false, closing: false, x: 220, y: 90 },
  multimedia: { open: false, minimized: false, maximized: false, closing: false, x: 240, y: 100 },
};

function DockIcon({ label, imageSrc, imageFit = "cover", imagePosition = "center", imageClassName = "", onClick }: DockIconProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="group dock-item relative grid h-[54px] w-[54px] place-items-center outline-none transition-transform duration-200 ease-out hover:-translate-y-3 hover:scale-125 focus-visible:-translate-y-3 focus-visible:scale-125"
    >
      <span className="dock-popover pointer-events-none absolute left-1/2 z-30 whitespace-nowrap px-3.5 py-1.5 text-xs font-medium text-neutral-950">
        {label}
      </span>
      <span className="dock-icon grid h-[54px] w-[54px] place-items-center overflow-hidden rounded-[16px] bg-white">
        <img
          src={imageSrc}
          alt=""
          className={`h-full w-full ${imageFit === "contain" ? "object-contain p-1.5" : "object-cover"} ${imageClassName}`}
          style={{ objectPosition: imagePosition }}
        />
      </span>
    </button>
  );
}

function TrafficButton({ color, label, onClick }: { color: string; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="h-3 w-3 rounded-full border border-black/15 shadow-[0_1px_1px_rgba(255,255,255,0.35)_inset]"
      style={{ backgroundColor: color }}
    />
  );
}

function WindowShell({ title, state, width = 980, height = 640, onClose, onMinimize, onMaximize, onMove, children }: WindowShellProps) {
  const windowRef = useRef<HTMLElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active || state.maximized) return;
      event.preventDefault();

      const currentWidth = windowRef.current?.offsetWidth ?? width;
      const currentHeight = windowRef.current?.offsetHeight ?? 520;
      const nextX = Math.max(WINDOW_MARGIN, Math.min(window.innerWidth - currentWidth - WINDOW_MARGIN, dragRef.current.originX + event.clientX - dragRef.current.startX));
      const nextY = Math.max(WINDOW_MARGIN, Math.min(window.innerHeight - currentHeight - DOCK_SAFE_AREA, dragRef.current.originY + event.clientY - dragRef.current.startY));
      onMove(nextX, nextY);
    };

    const stopDragging = () => {
      dragRef.current.active = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [onMove, state.maximized, width]);

  if (!state.open || state.minimized) return null;

  return (
    <section
      ref={windowRef}
      aria-label={`${title} window`}
      className={`mac-window absolute z-30 overflow-hidden text-neutral-950 ${state.closing ? "mac-window-closing" : "mac-window-opening"}`}
      style={
        state.maximized
          ? { left: 24, top: 32, width: "calc(100vw - 48px)", height: "calc(100vh - 150px)" }
          : { left: state.x, top: state.y, width: `min(${width}px, 88vw)`, height: `min(${height}px, 74vh)` }
      }
    >
      <header
        className="mac-titlebar flex h-12 cursor-default items-center border-b border-black/10 px-4 active:cursor-grabbing"
        onPointerDown={(event) => {
          if (state.maximized || (event.target as HTMLElement).closest("button")) return;
          event.preventDefault();
          dragRef.current = { active: true, startX: event.clientX, startY: event.clientY, originX: state.x, originY: state.y };
        }}
      >
        <div className="flex items-center gap-2">
          <TrafficButton color="#ff5f57" label={`Close ${title}`} onClick={onClose} />
          <TrafficButton color="#febc2e" label={`Minimize ${title}`} onClick={onMinimize} />
          <TrafficButton color="#28c840" label={`Zoom ${title}`} onClick={onMaximize} />
        </div>
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-black/62">{title}</div>
      </header>
      {children}
    </section>
  );
}

function AboutWindow(props: AppWindowProps) {
  const profileFields: [string, string][] = [
    ["Name", "Cao Duy Hoang (Joseph)"],
    ["Role", "Creative Leader"],
    ["Focus", "Short-Form Video Strategy"],
    ["Mail", "hoangcd.contact@gmail.com"],
  ];

  return (
    <WindowShell {...props} title="About Me" width={600} height={480}>
      <div className="h-[calc(100%-48px)] overflow-auto bg-white/80 p-6 backdrop-blur-2xl md:p-7">
        <div className="mb-8 flex items-center gap-6">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-black/8">
            <img src="/image/profile_image.jpg" alt="Cao Duy Hoang" className="h-full w-full object-cover" />
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px] leading-6">
            {profileFields.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-medium text-black/46">{label}:</dt>
                <dd className="font-medium text-black/82">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-3xl border border-black/8 bg-black/5 p-6 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-medium text-black/72 shadow-sm ring-1 ring-black/8">
              Cinematic storytelling
            </span>
            <span className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-medium text-black/72 shadow-sm ring-1 ring-black/8">
              Data-driven retention
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-black/74">
            I am Joseph, a Ho Chi Minh City-based Creative Leader. 3 years of video editing mastery, backed by visual design and team leadership.
          </p>
        </div>
      </div>
    </WindowShell>
  );
}

function NotesWindow(props: AppWindowProps) {
  return (
    <WindowShell {...props} title="Notes" width={1040}>
      <div className="grid h-[calc(100%-48px)] grid-cols-[230px_280px_1fr] bg-white/82 backdrop-blur-2xl max-lg:grid-cols-[210px_1fr] max-md:grid-cols-1">
        <aside className="border-r border-black/10 p-3 max-md:hidden">
          <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/42">iCloud</div>
          {noteFolders.map(([name, count], index) => (
            <button
              type="button"
              key={name}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm ${index === 1 ? "bg-[#d8a121]/90 text-white" : "text-black/72 hover:bg-black/6"}`}
            >
              <span className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-white/70 text-[11px] text-black/58">{index === 4 ? "T" : "N"}</span>
                {name}
              </span>
              {count ? <span className="text-xs opacity-70">{count}</span> : null}
            </button>
          ))}
        </aside>

        <aside className="border-r border-black/10 bg-white/52 max-lg:hidden">
          <div className="border-b border-black/10 p-3">
            <div className="rounded-lg bg-black/8 px-3 py-1.5 text-sm text-black/42">Search</div>
          </div>
          {notePreviews.map(([title, date, body], index) => (
            <div key={title} className={`border-b border-black/8 p-3 ${index === 0 ? "bg-[#f5d36b]/60" : "bg-white/35"}`}>
              <div className="flex justify-between gap-3 text-sm font-semibold text-black/78">
                <span>{title}</span>
                <span className="text-xs font-medium text-black/40">{date}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/48">{body}</p>
            </div>
          ))}
        </aside>

        <main className="overflow-auto bg-white/78 p-8">
          <div className="mb-6 text-xs font-medium text-black/38">Today 11:46 AM</div>
          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-black/86">Portfolio ideas</h2>
          <div className="mt-6 max-w-2xl space-y-4 text-[15px] leading-7 text-black/68">
            <p>Make the portfolio feel like a personal desktop: movable thumbnails, a glass dock, and small native-feeling details.</p>
            <p>Use the dock as the main navigation surface. Each app opens in-place like macOS, with familiar traffic-light controls.</p>
            <ul className="list-disc pl-5">
              <li>Keep the background visible.</li>
              <li>Use soft material panels.</li>
              <li>Let project thumbnails be draggable.</li>
            </ul>
          </div>
        </main>
      </div>
    </WindowShell>
  );
}

function AIWorkflowsWindow(props: AppWindowProps) {
  return (
    <WindowShell {...props} title="AI Generate - Workflows" width={1040} height={680}>
      <div className="grid h-[calc(100%-48px)] grid-cols-[1fr_1fr] bg-white/82 backdrop-blur-2xl max-md:grid-cols-1">
        <aside className="overflow-auto border-r border-black/10 bg-white/55 p-6 max-md:border-b max-md:border-r-0">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/42">Project</div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-black/86">AI Generate - Workflows</h2>
          <p className="mt-3 text-[14px] leading-6 text-black/62">
            Pipeline kết hợp AI generation với editorial direction để dựng concept video nhanh, từ moodboard đến final cut.
          </p>

          <div className="mt-6 space-y-2">
            {[
              ["Stage", "AI concept → cinematic edit"],
              ["Tools", "OpenArt, DaVinci Resolve, Premiere Pro"],
              ["Year", "2025"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-black/8 pb-2 text-[13px]">
                <span className="font-medium text-black/46">{k}</span>
                <span className="text-right font-medium text-black/82">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-black/4 p-5 text-center text-[13px] text-black/52">
            Final video sẽ được nhúng tại đây.
            <div className="mt-1 text-[11px] text-black/38">(coming soon)</div>
          </div>
        </aside>

        <main className="overflow-auto p-5">
          <figure className="overflow-hidden rounded-2xl border border-black/8 bg-black/5 shadow-sm">
            <img src="/image/ai-generate.jpg" alt="AI generated reference" className="block w-full object-cover" />
            <figcaption className="px-4 py-2.5 text-[12px] font-medium text-black/58">AI generated reference</figcaption>
          </figure>
          <figure className="mt-4 overflow-hidden rounded-2xl border border-black/8 bg-black/5 shadow-sm">
            <img src="/image/ai-timeline.jpg" alt="NLE timeline edit" className="block w-full object-cover" />
            <figcaption className="px-4 py-2.5 text-[12px] font-medium text-black/58">Timeline edit</figcaption>
          </figure>
        </main>
      </div>
    </WindowShell>
  );
}

type ProjectGalleryProps = AppWindowProps & {
  title: string;
  tagline: string;
  meta: [string, string][];
  images: { src: string; caption: string }[];
  subprojects?: { name: string; cover?: string; kind?: string }[];
  comingSoon?: boolean;
};

function ProjectGalleryWindow({ title, tagline, meta, images, subprojects, comingSoon, ...rest }: ProjectGalleryProps) {
  return (
    <WindowShell {...rest} title={title} width={1040} height={680}>
      <div className="grid h-[calc(100%-48px)] grid-cols-[1fr_1fr] bg-white/82 backdrop-blur-2xl max-md:grid-cols-1">
        <aside className="overflow-auto border-r border-black/10 bg-white/55 p-6 max-md:border-b max-md:border-r-0">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/42">Project</div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-black/86">{title}</h2>
          <p className="mt-3 text-[14px] leading-6 text-black/62">{tagline}</p>
          <div className="mt-6 space-y-2">
            {meta.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-black/8 pb-2 text-[13px]">
                <span className="font-medium text-black/46">{k}</span>
                <span className="text-right font-medium text-black/82">{v}</span>
              </div>
            ))}
          </div>
          {comingSoon ? (
            <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-black/4 p-5 text-center text-[13px] text-black/52">
              Nội dung đang được chuẩn bị.
              <div className="mt-1 text-[11px] text-black/38">(coming soon)</div>
            </div>
          ) : null}
        </aside>
        <main className="overflow-auto p-5 space-y-5">
          {subprojects && subprojects.length > 0 ? (
            <div>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/42">Sub-projects</div>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {subprojects.map((sp) => (
                  <div key={sp.name} className="overflow-hidden rounded-xl border border-black/8 bg-white/70 shadow-sm">
                    <div className="relative aspect-[4/3] bg-black/8">
                      {sp.cover ? (
                        <img src={sp.cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[28px] text-black/30">▶</div>
                      )}
                      {sp.kind ? (
                        <span className="absolute left-2 top-2 rounded-full bg-black/62 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          {sp.kind}
                        </span>
                      ) : null}
                    </div>
                    <div className="px-3 py-2 text-[12px] font-medium text-black/72">{sp.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {images.length === 0 && (!subprojects || subprojects.length === 0) ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-black/4 p-12 text-center text-[14px] text-black/52">
              Hình ảnh dự án sẽ được cập nhật sớm.
            </div>
          ) : (
            images.map((img) => (
              <figure key={img.src} className="overflow-hidden rounded-2xl border border-black/8 bg-black/5 shadow-sm">
                <img src={img.src} alt="" className="block w-full object-cover" />
                <figcaption className="px-4 py-2.5 text-[12px] font-medium text-black/58">{img.caption}</figcaption>
              </figure>
            ))
          )}
        </main>
      </div>
    </WindowShell>
  );
}

export default function MacDock() {
  const [windows, setWindows] = useState(defaultWindows);

  const updateWindow = (id: AppId, next: Partial<WindowState>) => {
    setWindows((current) => ({ ...current, [id]: { ...current[id], ...next } }));
  };

  const openWindow = (id: AppId) => updateWindow(id, { open: true, minimized: false, closing: false });

  const requestClose = (id: AppId) => {
    updateWindow(id, { closing: true });
    window.setTimeout(() => updateWindow(id, { open: false, minimized: false, maximized: false, closing: false }), CLOSE_ANIMATION_MS);
  };

  const toggleWindow = (id: AppId) => {
    windows[id].open && !windows[id].minimized ? requestClose(id) : openWindow(id);
  };

  useEffect(() => {
    const open = (id: string) => {
      if (id in defaultWindows) {
        setWindows((current) => ({
          ...current,
          [id]: { ...current[id as AppId], open: true, minimized: false, closing: false },
        }));
      }
    };
    (window as unknown as { __openMacApp?: (id: string) => void }).__openMacApp = open;
    const handler = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id) open(id);
    };
    window.addEventListener("macdock:open", handler);
    return () => {
      window.removeEventListener("macdock:open", handler);
      delete (window as unknown as { __openMacApp?: (id: string) => void }).__openMacApp;
    };
  }, []);

  return (
    <>
      <AboutWindow
        state={windows.about}
        onClose={() => requestClose("about")}
        onMinimize={() => updateWindow("about", { minimized: true })}
        onMaximize={() => updateWindow("about", { maximized: !windows.about.maximized })}
        onMove={(x, y) => updateWindow("about", { x, y })}
      />
      <NotesWindow
        state={windows.notes}
        onClose={() => requestClose("notes")}
        onMinimize={() => updateWindow("notes", { minimized: true })}
        onMaximize={() => updateWindow("notes", { maximized: !windows.notes.maximized })}
        onMove={(x, y) => updateWindow("notes", { x, y })}
      />
      <AIWorkflowsWindow
        state={windows.aiWorkflows}
        onClose={() => requestClose("aiWorkflows")}
        onMinimize={() => updateWindow("aiWorkflows", { minimized: true })}
        onMaximize={() => updateWindow("aiWorkflows", { maximized: !windows.aiWorkflows.maximized })}
        onMove={(x, y) => updateWindow("aiWorkflows", { x, y })}
      />
      <ProjectGalleryWindow
        title="Lighting & Context Set Up"
        tagline="Studio và on-location lighting cho beauty product, automotive, talkshow và TVC."
        meta={[
          ["Stage", "Photography + Videography"],
          ["Subjects", "Beauty, Vespa, Talkshow, TVC"],
          ["Year", "2024 - 2025"],
        ]}
        images={[]}
        subprojects={[
          { name: "Beauty Product", cover: "/image/cover-lighting.jpg", kind: "Photo" },
          { name: "Vespa Custom", cover: "/image/cover-vespa-custom.jpg", kind: "Photo" },
          { name: "Vespa Wheel Rim", cover: "/image/cover-vespa-wheel.jpg", kind: "Photo" },
          { name: "Talkshow", cover: "/image/cover-multimedia.jpg", kind: "Video" },
          { name: "TVC - Inspiration", kind: "Video" },
          { name: "TVC - Lần đầu tiên", kind: "Video" },
          { name: "TVC - Vòng tay mẹ", kind: "Video" },
          { name: "Product Promotion - FJN", kind: "Video" },
          { name: "Product Promotion - Quần áo trẻ em", kind: "Video" },
        ]}
        state={windows.lighting}
        onClose={() => requestClose("lighting")}
        onMinimize={() => updateWindow("lighting", { minimized: true })}
        onMaximize={() => updateWindow("lighting", { maximized: !windows.lighting.maximized })}
        onMove={(x, y) => updateWindow("lighting", { x, y })}
      />
      <ProjectGalleryWindow
        title="Video Creator"
        tagline="Long-form và short-form video cho fashion, skincare, wedding, motion graphics và recap event."
        meta={[
          ["Format", "Long content + reels + recap"],
          ["Clients", "Anais An, LiBé, Skincare Evidence, eTeacher"],
          ["Year", "2023 - 2025"],
        ]}
        images={[]}
        subprojects={[
          { name: "Anais An - Quần áo trẻ em", kind: "Video" },
          { name: "LiBé - Fashion Brand", kind: "Video" },
          { name: "Skincare Evidence - YT Long", kind: "Video" },
          { name: "eTeacher - Recap Event", kind: "Video" },
          { name: "Wedding", kind: "Video" },
          { name: "Motion - Credits Card", cover: "/image/cover-video.png", kind: "Motion" },
          { name: "Motion - Product Intro", kind: "Motion" },
          { name: "Motion - Resistance War", cover: "/image/cover-motion-war.jpg", kind: "Motion" },
        ]}
        state={windows.videoCreator}
        onClose={() => requestClose("videoCreator")}
        onMinimize={() => updateWindow("videoCreator", { minimized: true })}
        onMaximize={() => updateWindow("videoCreator", { maximized: !windows.videoCreator.maximized })}
        onMove={(x, y) => updateWindow("videoCreator", { x, y })}
      />
      <ProjectGalleryWindow
        title="Visual Design"
        tagline="Print collateral và social poster, định hướng visual cho brand campaign."
        meta={[
          ["Scope", "Printing + Social Poster"],
          ["Highlights", "Vespa Sprint, Catalogue"],
          ["Year", "2024"],
        ]}
        images={[]}
        subprojects={[
          { name: "Vespa Sprint - Social Poster", cover: "/image/cover-design.jpg", kind: "Poster" },
          { name: "Catalogue", cover: "/image/cover-design-catalogue.jpg", kind: "Print" },
          { name: "Social Poster - Series", cover: "/image/cover-design-poster.jpg", kind: "Poster" },
          { name: "Printing Collection", kind: "Print" },
        ]}
        state={windows.visualDesign}
        onClose={() => requestClose("visualDesign")}
        onMinimize={() => updateWindow("visualDesign", { minimized: true })}
        onMaximize={() => updateWindow("visualDesign", { maximized: !windows.visualDesign.maximized })}
        onMove={(x, y) => updateWindow("visualDesign", { x, y })}
      />
      <ProjectGalleryWindow
        title="Khóa học Multimedia"
        tagline="Khoá đào tạo multimedia tổng hợp - đang chuẩn bị nội dung."
        meta={[
          ["Status", "Coming soon"],
          ["Topics", "Photography, video, design"],
          ["Mentor", "Cao Duy Hoang"],
        ]}
        images={[]}
        comingSoon
        state={windows.multimedia}
        onClose={() => requestClose("multimedia")}
        onMinimize={() => updateWindow("multimedia", { minimized: true })}
        onMaximize={() => updateWindow("multimedia", { maximized: !windows.multimedia.maximized })}
        onMove={(x, y) => updateWindow("multimedia", { x, y })}
      />

      <div className="absolute inset-x-0 bottom-5 z-40 flex justify-center px-4">
        <nav aria-label="macOS style dock" className="apple-dock flex items-end justify-center gap-3 px-4 py-3">
          <DockIcon label="About Me" imageSrc="/image/icon_apple.jpg" imageClassName="-translate-y-[10px] scale-[1.12]" onClick={() => toggleWindow("about")} />
          <DockIcon label="Notes" imageSrc="/image/notes.svg" imageFit="contain" onClick={() => toggleWindow("notes")} />
          <div className="mx-1 h-11 w-px self-center bg-white/28 shadow-[1px_0_0_rgba(0,0,0,0.22)]" />
          {dockSocials.map((social) => (
            <DockIcon key={social.label} label={social.label} imageSrc={social.imageSrc} imageFit="contain" />
          ))}
        </nav>
      </div>
    </>
  );
}
