import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BranchDirectory from "./BranchDirectory";
import type { Branch } from "@/data/brand";

const fixtures = (count: number): Branch[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `test-only-${index + 1}`,
    ordinal: index + 1,
    name: `فرع اختبار ${index + 1}`,
    city: null,
    address: null,
    phone: null,
    hours: null,
    mapsUrl: null,
    externalId: null,
  }));

describe("scalable branch directory", () => {
  it.each([9, 15, 20])(
    "renders a native select for %i records, not a fixed nine-column grid",
    count => {
      const html = renderToStaticMarkup(
        <BranchDirectory items={fixtures(count)} />
      );
      expect((html.match(/<option /g) ?? []).length).toBe(count);
      expect(html).toContain(`فرع اختبار ${count}`);
      expect(html).toContain('<label for="branch-choice">');
      expect(html).toContain('<select id="branch-choice"');
      expect(html).not.toContain("branch-selector");
    }
  );
  it("supports an empty source without rendering fake branches", () => {
    const html = renderToStaticMarkup(<BranchDirectory items={[]} />);
    expect(html).toContain("بيانات الفروع تُضاف بعد اعتمادها");
    expect(html).not.toContain("<option");
  });
});
