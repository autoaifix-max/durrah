"use client";

import { useEffect, useState } from "react";
import { ArrowUpLeft, Menu, X } from "lucide-react";
import { brand } from "@/data/brand";

export const navigation = [
  { id: "home", label: "الرئيسية" },
  { id: "menu", label: "قائمة الطعام" },
  { id: "about", label: "عن درة العنب" },
  { id: "branches", label: "فروعنا" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
    );
    document
      .querySelectorAll("main section[id]")
      .forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  const closeMenu = () => setOpen(false);
  return (
    <>
      <a href="#main-content" className="skip-link">
        انتقل إلى المحتوى
      </a>
      <header className="site-header">
        <div className="header-inner page-width">
          <a
            className="brand-lockup"
            href="#home"
            aria-label="درة العنب — الرئيسية"
            onClick={closeMenu}
          >
            <span className="logo-frame">
              <img
                src={brand.assets.logo}
                alt="شعار درة العنب"
                width="49"
                height="62"
              />
            </span>
            <span className="brand-text">
              <strong>{brand.name}</strong>
              <small>{brand.tagline}</small>
            </span>
          </a>
          <nav className="desktop-navigation" aria-label="القائمة الرئيسية">
            {navigation.map(item => (
              <a
                key={item.id}
                href={item.id === "menu" ? "/menu/" : `#${item.id}`}
                className={active === item.id ? "active" : ""}
                aria-current={active === item.id ? "location" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a className="header-contact" href="#contact">
            تواصل معنا <ArrowUpLeft size={17} aria-hidden="true" />
          </a>
          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label="قائمة الجوال"
          >
            {navigation.map(item => (
              <a
                key={item.id}
                href={item.id === "menu" ? "/menu/" : `#${item.id}`}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ))}
            <a href="#contact" onClick={closeMenu}>
              تواصل معنا
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
