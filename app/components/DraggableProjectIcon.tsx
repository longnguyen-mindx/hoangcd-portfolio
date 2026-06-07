"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Project } from "../data/projects";

type Position = {
  x: number;
  y: number;
  ready: boolean;
};

const EDGE_PADDING = 8;
const DOCK_SAFE_AREA = 96;
const FALLBACK_WIDTH = 164;
const FALLBACK_HEIGHT = 150;

export default function DraggableProjectIcon({ project, priority = false }: { project: Project; priority?: boolean }) {
  const iconRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ moved: false });
  const [position, setPosition] = useState<Position>({ x: 0, y: 0, ready: false });
  const [isDragging, setIsDragging] = useState(false);

  const clampToViewport = (x: number, y: number) => {
    const width = iconRef.current?.offsetWidth ?? FALLBACK_WIDTH;
    const height = iconRef.current?.offsetHeight ?? FALLBACK_HEIGHT;

    return {
      x: Math.max(EDGE_PADDING, Math.min(window.innerWidth - width - EDGE_PADDING, x)),
      y: Math.max(EDGE_PADDING, Math.min(window.innerHeight - height - DOCK_SAFE_AREA, y)),
    };
  };

  useEffect(() => {
    const placeIcon = () => {
      const width = iconRef.current?.offsetWidth ?? FALLBACK_WIDTH;
      setPosition({
        ...clampToViewport((window.innerWidth * project.left) / 100 - width / 2, (window.innerHeight * project.top) / 100),
        ready: true,
      });
    };

    placeIcon();
    window.addEventListener("resize", placeIcon);
    return () => window.removeEventListener("resize", placeIcon);
  }, [project.left, project.top]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = position.x;
    const originY = position.y;
    dragRef.current = { active: true, startX, startY, originX, originY, moved: false };
    setIsDragging(true);

    let frame = 0;
    let nextX = originX;
    let nextY = originY;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragRef.current.moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) dragRef.current.moved = true;
      const clamped = clampToViewport(originX + dx, originY + dy);
      nextX = clamped.x;
      nextY = clamped.y;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setPosition((current) => ({ ...current, x: nextX, y: nextY }));
      });
    };

    const stopDragging = () => {
      if (frame) cancelAnimationFrame(frame);
      dragRef.current.active = false;
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
  };

  return (
    <div
      ref={iconRef}
      className="absolute w-[116px] touch-none select-none text-center sm:w-[142px] md:w-[164px]"
      style={{ left: position.x, top: position.y, opacity: position.ready ? 1 : 0, zIndex: isDragging ? 25 : 10 }}
      onPointerDown={startDrag}
      onClick={() => {
        if (dragRef.current.moved) {
          dragRef.current.moved = false;
          return;
        }
        if (!project.appId) return;
        const w = window as unknown as { __openMacApp?: (id: string) => void };
        if (w.__openMacApp) w.__openMacApp(project.appId);
        else window.dispatchEvent(new CustomEvent("macdock:open", { detail: { id: project.appId } }));
      }}
    >
      <div
        className={`block transition-[filter,transform] duration-200 ease-out hover:brightness-110 ${isDragging ? "scale-105" : "hover:scale-105"}`}
        style={{ transform: `rotate(${project.rotate}deg)` }}
      >
        <div className="project-shadow relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl border border-white/15 bg-neutral-800 active:cursor-grabbing">
          <Image src={project.src} alt="" fill sizes="164px" className="object-cover" draggable={false} priority={priority} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />
        </div>
        <span className="mt-2 block rounded-md px-1 text-[11px] font-light leading-tight text-white/72 drop-shadow md:text-xs">
          {project.label}
        </span>
      </div>
    </div>
  );
}
