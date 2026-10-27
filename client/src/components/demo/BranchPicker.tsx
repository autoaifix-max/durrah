"use client";

import { useId } from "react";
import { Check, MapPin } from "lucide-react";
import { demoBranches } from "@/data/demo";
import { useDemo } from "./DemoProvider";

export default function BranchPicker({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { branchId, setBranchId } = useDemo();
  const id = useId();
  if (compact)
    return (
      <div className="demo-branch-native">
        <label htmlFor={id}>الفرع التجريبي</label>
        <select
          id={id}
          value={branchId ?? ""}
          onChange={event => setBranchId(event.target.value)}
        >
          <option value="" disabled>
            اختر الفرع
          </option>
          {demoBranches.map(branch => (
            <option value={branch.id} key={branch.id}>
              {branch.label}
            </option>
          ))}
        </select>
      </div>
    );
  return (
    <section className="demo-screen">
      <div className="demo-title">
        <span className="d-menu-eyebrow">هوية واحدة، في كل الفروع</span>
        <h1>اختر فرعك</h1>
        <p>
          فروع مرقّمة لتجربة العرض. الأسماء والعناوين الفعلية تضاف عند التفعيل.
        </p>
      </div>
      <fieldset className="demo-branches">
        <legend className="sr-only">اختيار الفرع التجريبي</legend>
        <div className="demo-branches-grid">
          {demoBranches.map(branch => (
            <label
              className={`demo-branch-option ${branchId === branch.id ? "selected" : ""}`}
              key={branch.id}
            >
              <input
                type="radio"
                name="demo-branch"
                value={branch.id}
                checked={branchId === branch.id}
                onChange={() => setBranchId(branch.id)}
              />
              <MapPin size={21} aria-hidden="true" />
              <span>
                <strong>{branch.label}</strong>
                <small>للمحاكاة فقط</small>
              </span>
              {branchId === branch.id && <Check size={18} aria-hidden="true" />}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="demo-panel demo-branch-note">
        اختيار الفرع لا يؤكد التوافر أو نطاق التوصيل. لا تُرسل طلبات لأي فرع في
        هذه النسخة.
      </div>
      <a className="demo-primary" href="/menu/">
        متابعة اختيار الأصناف
      </a>
      <a className="demo-more" href="/menu/checkout/">
        انتقل إلى إكمال الطلب
      </a>
    </section>
  );
}
