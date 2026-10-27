"use client";

import { Home, Leaf, MapPin, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "menu", label: "القائمة", icon: Leaf },
  { id: "branches", label: "الفروع", icon: MapPin },
  { id: "contact", label: "التواصل", icon: MessageCircle },
];

export default function MobileNav() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );
    for (const { id } of items) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    const hashChange = () => {
      const id = window.location.hash.slice(1);
      if (items.some(item => item.id === id)) setActive(id);
    };
    window.addEventListener("hashchange", hashChange);
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", hashChange);
    };
  }, []);

  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل السريع للجوال">
      {items.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={id === "menu" ? "/menu/" : `#${id}`}
          onClick={() => setActive(id)}
          aria-current={active === id ? "location" : undefined}
          className={active === id ? "active" : ""}
        >
          <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
