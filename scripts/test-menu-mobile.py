from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import os

BASE = os.environ.get('MENU_TEST_ORIGIN', 'http://127.0.0.1:3000').rstrip('/')
OUT = Path(os.environ.get('DURRAT_TEST_OUTPUT', str(Path.cwd() / '.webdev' / 'menu-validation')))
OUT.mkdir(parents=True, exist_ok=True)


def arabic(value):
    return str(value).translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'unexpected page horizontal overflow'


profiles = [
    ('webkit', 'iphone-small', 320, 568),
    ('webkit', 'iphone-se', 375, 667),
    ('webkit', 'iphone', 390, 844),
    ('webkit', 'iphone-large', 430, 932),
    ('webkit', 'iphone-landscape', 932, 430),
    ('chromium', 'android', 393, 851),
]
results = []
with sync_playwright() as p:
    for engine, label, width, height in profiles:
        print('فحص', label, width, height, flush=True)
        browser = getattr(p, engine).launch()
        context = browser.new_context(viewport={'width': width, 'height': height}, is_mobile=True, has_touch=True, device_scale_factor=2, locale='ar-SA', reduced_motion='reduce')
        page = context.new_page()
        errors, writes = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: writes.append(request.url) if request.method not in ('GET', 'HEAD') else None)
        response = page.goto(BASE + '/menu/', wait_until='networkidle')
        assert response.status == 200
        assert page.locator('.d-product-card').count() == 9
        no_overflow(page)
        page.get_by_role('button', name='كبة', exact=True).tap()
        assert page.locator('.d-product-card').count() == 2
        page.get_by_role('button', name='الكل', exact=True).tap()
        page.get_by_role('searchbox').fill('سبايسي')
        assert page.locator('.d-product-card').count() == 2
        page.get_by_role('searchbox').fill('صنف غير موجود')
        assert page.locator('.d-product-card').count() == 0
        page.get_by_role('button', name='عرض جميع الأصناف', exact=True).tap()
        assert page.locator('.d-product-card').count() == 9
        page.locator('.d-bag-button').tap()
        assert page.locator('.d-order-notice').is_visible()
        assert page.locator('.d-order-notice').get_by_role('heading', name='الطلب الإلكتروني غير مفعّل', exact=True).is_visible()
        page.get_by_role('button', name='متابعة تصفح القائمة', exact=True).tap()
        assert not page.locator('.d-order-notice').is_visible()
        if label == 'iphone':
            page.screenshot(path=str(OUT / 'menu-iphone.png'), full_page=True)
        page.locator('[data-product="grape-classic"] .d-card-cta').tap()
        page.wait_for_url('**/menu/grape-classic/')
        assert page.locator('h1').inner_text() == 'ورق عنب كلاسيك'
        assert page.locator('input[type="radio"]').count() == 7
        assert page.locator('input[type="radio"]:checked').input_value() == 'pack-20'
        no_overflow(page)
        page.locator('label.d-pack-choice').filter(has=page.locator('input[value="pack-70"]')).tap()
        page.get_by_role('button', name='زيادة عدد البوكسات', exact=True).tap()
        assert arabic(70 * 2) in page.locator('.d-summary-total').inner_text()
        page.get_by_label('عدد البوكسات', exact=True).fill('٣')
        assert arabic(70 * 3) in page.locator('.d-summary-total').inner_text()
        page.get_by_label('عدد البوكسات', exact=True).fill('0')
        assert page.locator('.d-quantity-error').is_visible()
        assert '—' in page.locator('.d-summary-total').inner_text()
        page.get_by_label('عدد البوكسات', exact=True).fill('1e2')
        assert page.locator('.d-quantity-error').is_visible()
        page.get_by_label('عدد البوكسات', exact=True).fill('1')
        assert page.locator('.d-add-to-cart').is_disabled()
        if label == 'iphone':
            page.screenshot(path=str(OUT / 'product-iphone.png'), full_page=True)
        page.get_by_role('link', name='تفاصيل المنتج', exact=True).tap()
        page.wait_for_url('**/menu/')
        no_overflow(page)
        assert page.request.get(BASE + '/menu/does-not-exist/').status == 404
        assert not errors, errors
        assert not writes, writes
        results.append({'engine': engine, 'profile': label, 'viewport': [width,height], 'passed': True, 'jsErrors': errors, 'writeRequests': writes})
        context.close()
        browser.close()
(OUT / 'results.json').write_text(json.dumps({'tests': results, 'limit': 'محاكاة WebKit/Chromium؛ ليست اختبارًا على آيفون فعلي أو داخل تطبيقات التواصل.'}, ensure_ascii=False, indent=2) + '\n')
print('اجتازت التفاعلات جميع مقاسات المحاكاة المحددة.', flush=True)
