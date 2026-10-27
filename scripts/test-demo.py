from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json
import os
import re

BASE = os.environ.get('DEMO_TEST_ORIGIN', 'http://127.0.0.1:3000').rstrip('/')
OUT = Path(os.environ.get('DURRAT_TEST_OUTPUT', str(Path.cwd() / '.webdev' / 'demo-validation')))
OUT.mkdir(parents=True, exist_ok=True)


def ar(number):
    return str(number).translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))


def check_width(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'عرض أفقي غير مقصود'


profiles = [
    ('webkit', 'iphone-small', 320, 568, 'pickup', 'cash'),
    ('webkit', 'iphone-se', 375, 667, 'delivery', 'mada'),
    ('webkit', 'iphone', 390, 844, 'pickup', 'apple-pay'),
    ('webkit', 'iphone-large', 430, 932, 'delivery', 'apple-pay'),
    ('webkit', 'iphone-landscape', 932, 430, 'pickup', 'mada'),
    ('chromium', 'android', 393, 851, 'delivery', 'cash'),
]
results = []
with sync_playwright() as p:
    for engine, name, width, height, fulfillment, payment in profiles:
        print('تجربة', name, fulfillment, payment, flush=True)
        browser = getattr(p, engine).launch()
        context = browser.new_context(viewport={'width':width,'height':height}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='ar-SA', reduced_motion='reduce')
        page = context.new_page()
        errors, writes = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: writes.append(request.url) if request.method not in ('GET','HEAD') else None)
        page.goto(BASE + '/menu/', wait_until='networkidle')
        assert page.locator('.d-product-card').count() == 9
        assert page.locator('.demo-global-strip').is_visible()
        check_width(page)
        page.locator('[data-product="grape-classic"] .d-card-cta').tap()
        page.wait_for_url('**/menu/grape-classic/')
        expect(page.locator('.d-add-to-cart')).to_be_enabled()
        page.get_by_label('عدد البوكسات', exact=True).fill('2')
        page.locator('.d-add-to-cart').tap()
        expect(page.locator('.demo-add-result')).to_contain_text('تمت الإضافة')
        page.get_by_role('link', name='عرض السلة', exact=True).tap()
        page.wait_for_url('**/menu/cart/')
        expect(page.locator('.demo-cart-line')).to_have_count(1)
        assert ar(20 * 2) in page.locator('.demo-bill strong').inner_text()
        page.locator('.demo-cart-tools .d-stepper button').first.tap()
        expect(page.locator('.demo-bill strong')).to_contain_text(ar(20 * 3))
        page.locator('.demo-cart-tools .d-stepper button').last.tap()
        expect(page.locator('.demo-bill strong')).to_contain_text(ar(20 * 2))
        page.reload(wait_until='networkidle')
        expect(page.locator('.demo-cart-line')).to_have_count(1)
        page.goto(BASE + '/menu/grape-classic/', wait_until='networkidle')
        page.locator('input[value="pack-10"]').check()
        page.get_by_label('عدد البوكسات', exact=True).fill('1')
        page.locator('.d-add-to-cart').tap()
        page.goto(BASE + '/menu/fatteh-large/', wait_until='networkidle')
        page.locator('.d-add-to-cart').tap()
        page.get_by_role('link', name='عرض السلة', exact=True).tap()
        page.wait_for_url('**/menu/cart/')
        expect(page.locator('.demo-cart-line')).to_have_count(3)
        page.locator('[data-cart-product="fatteh-large"] .demo-trash').tap()
        expect(page.locator('.demo-cart-line')).to_have_count(2)
        total = 20 * 2 + 10
        expect(page.locator('.demo-bill strong')).to_contain_text(ar(total))
        check_width(page)
        if name == 'iphone':
            page.screenshot(path=str(OUT / 'cart-iphone.png'))
        page.get_by_role('link', name='متابعة الطلب', exact=False).tap()
        page.wait_for_url('**/menu/checkout/')
        page.locator('.demo-confirm-order').tap()
        expect(page.locator('.demo-error')).to_contain_text('اختر فرعًا')
        page.locator('.demo-branch-native select').select_option(index=3)
        if fulfillment == 'delivery':
            page.get_by_role('button', name=re.compile('^توصيل')).tap()
            expect(page.locator('.demo-address')).to_be_visible()
        page.locator(f'input[name="demo-payment"][value="{payment}"]').check()
        assert page.locator('input[type="tel"], input[autocomplete="cc-number"], input[autocomplete="cc-csc"], input[name="customerName"], input[type="email"]').count() == 0
        assert '05XXXXXXXX' in page.locator('.demo-customer').inner_text()
        check_width(page)
        if name == 'iphone':
            page.screenshot(path=str(OUT / 'checkout-iphone.png'))
        page.locator('.demo-confirm-order').tap()
        page.wait_for_url('**/menu/tracking/')
        expect(page.locator('h1')).to_have_text('تم تأكيد طلبك التجريبي')
        assert page.locator('.demo-order-id').inner_text().startswith('DEMO-')
        saved = page.evaluate('JSON.parse(localStorage.getItem("durat-demo-v1"))')
        assert saved['cart'] == []
        assert saved['order']['kind'] == 'demo'
        assert saved['order']['totalSar'] == total
        assert saved['order']['fulfillment'] == fulfillment
        assert saved['order']['payment'] == payment
        assert len(saved['order']['lines']) == 2
        assert not any(key in saved for key in ['customer','phone','card','address'])
        for step in range(3):
            page.locator('.demo-next-stage').tap()
        expect(page.locator('.demo-completed')).to_be_visible()
        page.reload(wait_until='networkidle')
        expect(page.locator('.demo-completed')).to_be_visible()
        check_width(page)
        if name == 'iphone':
            page.screenshot(path=str(OUT / 'tracking-iphone.png'))
        page.get_by_role('link', name='تجربة طلب آخر', exact=False).tap()
        page.wait_for_url('**/menu/')
        page.goto(BASE + '/menu/cart/', wait_until='networkidle')
        expect(page.locator('h1')).to_have_text('سلتك بانتظار أول اختيار')
        assert page.request.get(BASE + '/menu/not-a-product/').status == 404
        assert not errors, errors
        assert not writes, writes
        results.append({'engine':engine,'profile':name,'viewport':[width,height],'fulfillment':fulfillment,'payment':payment,'passed':True,'jsErrors':errors,'writeRequests':writes})
        context.close()
        browser.close()
(OUT / 'results.json').write_text(json.dumps({'tests':results,'limit':'محاكاة WebKit/Chromium؛ ليست اختبارًا على آيفون فعلي. لا تحصيل أو إرسال طلبات تجارية.'},ensure_ascii=False,indent=2)+'\n')
print('اجتازت رحلة العرض جميع حالات الجوال، دون طلبات كتابة أو أخطاء JavaScript.',flush=True)
