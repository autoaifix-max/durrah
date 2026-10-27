"""Validate concrete mobile regressions in a browser simulation, not real iOS.
Requires Python Playwright and its WebKit/Chromium binaries.
Run: python3 scripts/test-mobile.py [preview-origin]
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

origin = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3000"
results = []
artifacts = Path(".webdev/mobile-validation")
artifacts.mkdir(parents=True, exist_ok=True)
profiles = [
    ("webkit", "iPhone-SE", 375, 667),
    ("webkit", "iPhone-13", 390, 844),
    ("webkit", "iPhone-large", 430, 932),
    ("webkit", "small-phone", 320, 568),
    ("webkit", "iPhone-landscape", 844, 390),
    ("webkit", "iPhone-large-landscape", 932, 430),
    ("chromium", "Android-mobile", 393, 851),
]

with sync_playwright() as p:
    for engine, label, width, height in profiles:
        browser = getattr(p, engine).launch()
        context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=2, is_mobile=True, has_touch=True, locale="ar-SA", reduced_motion="reduce")
        page = context.new_page()
        errors = []
        requests = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("request", lambda request: requests.append(request.url))
        response = page.goto(origin, wait_until="networkidle")
        assert response and response.status == 200, f"{label}: homepage status"
        page.evaluate("document.fonts.ready")
        assert page.locator("html").get_attribute("dir") == "rtl"
        assert "maximum-scale" not in (page.locator('meta[name="viewport"]').get_attribute("content") or "")
        assert page.locator(".mobile-bottom-nav").is_visible()
        assert page.locator(".mobile-bottom-nav a").count() == 4
        for box in page.locator(".mobile-bottom-nav a").all():
            bounds = box.bounding_box()
            assert bounds and bounds["height"] >= 44, f"{label}: touch target"
        def no_overflow():
            return page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
        assert no_overflow(), f"{label}: horizontal overflow at home"
        assert not any("menu-original_" in url for url in requests), f"{label}: full menu loaded before opening"
        assert not any("fonts.googleapis.com" in url or "fonts.gstatic.com" in url for url in requests), f"{label}: external font dependency"
        if label == "iPhone-13":
            page.screenshot(path=str(artifacts / "iphone-home.png"), full_page=False)
        page.locator('.mobile-bottom-nav a[href="#menu"]').tap()
        page.locator("#tab-cabbage").tap()
        assert page.locator("#tab-cabbage").get_attribute("aria-selected") == "true"
        assert "ملفوف كلاسيك" in page.locator("#category-panel").inner_text()
        page.locator("#tab-fatteh").tap()
        assert "فتة ورق عنب كبير" in page.locator("#category-panel").inner_text()
        assert no_overflow(), f"{label}: horizontal overflow in catalog"
        page.locator(".source-menu-heading button").tap()
        assert page.locator(".menu-dialog").evaluate("el => el.open")
        page.wait_for_function("document.querySelector('.menu-dialog img')?.naturalWidth > 0")
        page.locator(".zoom-button").tap()
        assert page.locator(".menu-dialog-scroll").evaluate("el => el.scrollWidth > el.clientWidth")
        assert page.evaluate("getComputedStyle(document.body).overflow") == "hidden"
        page.get_by_role("button", name="إغلاق قائمة المنتجات", exact=True).tap()
        assert not page.locator(".menu-dialog").evaluate("el => el.open")
        assert page.evaluate("getComputedStyle(document.body).overflow") != "hidden"
        page.locator('.mobile-bottom-nav a[href="#branches"]').tap()
        page.locator("#branch-choice").select_option(index=8)
        assert "سجل الفرع ٩" in page.locator(".branch-details-title").inner_text()
        assert page.locator("#branch-choice option").count() == 9
        assert no_overflow(), f"{label}: horizontal overflow in branches"
        page.locator(".menu-toggle").tap()
        assert page.locator("#mobile-navigation").is_visible()
        page.locator('#mobile-navigation a[href="#about"]').tap()
        assert not page.locator("#mobile-navigation").count()
        page.locator('.mobile-bottom-nav a[href="#contact"]').tap()
        assert page.locator(".button-pending").is_disabled()
        assert page.locator('a[href*="wa.me"]').count() == 0
        # Enlarge text to catch clipping on compact iPhone layouts.
        page.add_style_tag(content="body { font-size: 125%; } h1 { font-size: 4rem !important; }")
        assert no_overflow(), f"{label}: horizontal overflow with enlarged text"
        assert not errors, f"{label}: JavaScript errors: {errors}"
        missing = page.goto(origin + "/not-a-real-page/", wait_until="domcontentloaded")
        assert missing and missing.status == 404, f"{label}: missing route did not return 404"
        assert "الصفحة غير موجودة" in page.locator("main").inner_text()
        result = {"engine": engine, "profile": label, "viewport": [width, height], "status": "passed", "javascript_errors": errors}
        results.append(result)
        print(json.dumps(result, ensure_ascii=False), flush=True)
        context.close()
        browser.close()

(artifacts / "results.json").write_text(json.dumps({"scope": "Browser simulation, not physical iPhone or in-app browser certification", "results": results}, ensure_ascii=False, indent=2) + "\n")
print("Mobile interaction checks passed; simulation only.", flush=True)
