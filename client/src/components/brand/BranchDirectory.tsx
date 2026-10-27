"use client";

import { useState } from "react";
import { ArrowUpLeft, Check, MapPin } from "lucide-react";
import { formatArabicNumber, type Branch } from "@/data/brand";
import { catalogProvider } from "@/services/catalog";

export default function BranchDirectory({
  items = catalogProvider.getBranches(),
}: {
  items?: readonly Branch[];
}) {
  const [selectedBranchId, setSelectedBranchId] = useState(items[0]?.id ?? "");
  const branch = items.find(item => item.id === selectedBranchId) ?? items[0];
  if (!branch)
    return (
      <div className="branch-directory">
        <p>بيانات الفروع تُضاف بعد اعتمادها.</p>
      </div>
    );

  return (
    <div className="branch-directory">
      <div className="directory-heading">
        <span className="icon-circle">
          <MapPin size={22} aria-hidden="true" />
        </span>
        <div>
          <h3>دليل الفروع</h3>
          <p>اختر الفرع لعرض بياناته.</p>
        </div>
      </div>
      <div className="branch-city-counts" aria-label="عدد الفروع حسب المدينة">
        {Array.from(
          items.reduce((counts, item) => {
            if (item.city) counts.set(item.city, (counts.get(item.city) ?? 0) + 1);
            return counts;
          }, new Map<string, number>())
        ).map(([city, count]) => (
          <span className="branch-city-count" key={city}>
            {city} <strong>{formatArabicNumber(count)}</strong>
          </span>
        ))}
      </div>
      <div className="branch-picker">
        <label htmlFor="branch-choice">
          الفرع <span>{formatArabicNumber(items.length)} فرعًا</span>
        </label>
        <select
          id="branch-choice"
          value={branch.id}
          onChange={event => setSelectedBranchId(event.target.value)}
        >
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name ??
                `سجل الفرع ${formatArabicNumber(item.ordinal)} — بانتظار البيانات`}
              {item.city ? ` — ${item.city}` : ""}
            </option>
          ))}
        </select>
      </div>
      <p className="ordinal-note">
        الأرقام لتنظيم السجلات، وليست أسماء الفروع الرسمية.
      </p>
      <div className="branch-details" aria-live="polite">
        <div className="branch-details-title">
          <h4>
            {branch.name ?? `سجل الفرع ${formatArabicNumber(branch.ordinal)}`}
          </h4>
          <span className="pending-badge">
            {branch.name && branch.address
              ? "بيانات الفرع"
              : "بانتظار البيانات"}
          </span>
        </div>
        <dl>
          <div>
            <dt>اسم الفرع</dt>
            <dd>{branch.name ?? "يُضاف بعد الاعتماد"}</dd>
          </div>
          <div>
            <dt>العنوان</dt>
            <dd>{branch.address ?? "سيتم تحديث معلومات الموقع قريبًا"}</dd>
          </div>
          <div>
            <dt>أوقات العمل</dt>
            <dd>{branch.hours ?? "تُضاف بعد الاعتماد"}</dd>
          </div>
          <div>
            <dt>رقم التواصل</dt>
            <dd dir={branch.phone ? "ltr" : "rtl"}>
              {branch.phone ?? "يُضاف بعد الاعتماد"}
            </dd>
          </div>
        </dl>
        {branch.mapsUrl &&
          /^https:\/\/(www\.)?google\.com\/maps\//.test(branch.mapsUrl) && (
            <a
              className="text-link"
              href={branch.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              الاتجاهات <ArrowUpLeft size={16} aria-hidden="true" />
            </a>
          )}
      </div>
      <p className="branch-integrity-note">
        <Check size={15} aria-hidden="true" /> نعرض بيانات الفروع بعد اعتمادها،
        دون مواقع افتراضية. لا تظهر خرائط Google إلا بعد اعتماد رابط صحيح.
      </p>
    </div>
  );
}
