import {
  ArrowDown,
  ArrowUpLeft,
  Expand,
  Leaf,
  MessageCircle,
  Plus,
} from "lucide-react";
import SiteHeader from "@/components/brand/SiteHeader";
import BranchGallery from "@/components/brand/BranchGallery";
import CatalogMenu from "@/components/brand/CatalogMenu";
import BranchDirectory from "@/components/brand/BranchDirectory";
import MobileNav from "@/components/brand/MobileNav";
import ResponsivePhoto from "@/components/brand/ResponsivePhoto";
import { brand, formatArabicNumber } from "@/data/brand";
import { catalogProvider, getWhatsAppUrl } from "@/services/catalog";

export default function Home() {
  const categories = catalogProvider.getCategories();
  const branches = catalogProvider.getBranches();
  const whatsappUrl = getWhatsAppUrl();

  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="main-content">
        <section
          id="home"
          className="hero page-width"
          aria-labelledby="hero-heading"
        >
          <div className="hero-copy">
            <span className="eyebrow">
              <Leaf size={15} aria-hidden="true" /> من واجهاتنا الخضراء… إلى
              لَمّتكم
            </span>
            <h1 id="hero-heading">
              درة العنب.
              <br />
              <span>طازج يومياً.</span>
            </h1>
            <p className="hero-description">
              ورق عنب، ملفوف، كبة ومحاشي.
              <br />
              أصناف تعرفونها، وهوية واحدة تجمع فروعنا.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/menu/">
                قائمة الطعام <ArrowUpLeft size={19} aria-hidden="true" />
              </a>
              <a className="text-link" href="#branches">
                تعرّف على فروعنا <ArrowUpLeft size={17} aria-hidden="true" />
              </a>
            </div>
            <div className="hero-facts">
              <div>
                <strong>{formatArabicNumber(branches.length)}</strong>
                <span>فروع، بهوية واحدة</span>
              </div>
              <span className="facts-divider" />
              <div>
                <strong>{formatArabicNumber(categories.length)}</strong>
                <span>مجموعات أصناف في قائمتنا</span>
              </div>
            </div>
            <a className="scroll-cue" href="#menu">
              <span>اكتشف درة العنب</span>
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <figure className="hero-visual">
            <div className="hero-photo-wrap">
              <ResponsivePhoto
                asset="opening"
                alt="واجهة درة العنب الخضراء في صورة افتتاح حقيقية مرفقة"
                sizes="(max-width: 650px) calc(100vw - 48px), 540px"
                eager
              />
            </div>
            <div className="hero-photo-caption">
              <span className="caption-dot" />
              <span>من لحظات الافتتاح</span>
              <span className="caption-note">صورة حقيقية</span>
            </div>
            <div className="hero-brand-stamp">
              <img src={brand.assets.logo} alt="" width="62" height="77" />
              <span>هوية تعرفونها</span>
            </div>
          </figure>
        </section>

        <div className="brand-ribbon" aria-hidden="true">
          <div className="ribbon-inner">
            <span>ورق عنب</span>
            <Plus />
            <span>ملفوف</span>
            <Plus />
            <span>كبة</span>
            <Plus />
            <span>محاشي</span>
            <Plus />
            <span>طازج يومياً</span>
            <Plus />
            <span>درة العنب</span>
          </div>
        </div>

        <CatalogMenu />

        <section
          id="about"
          className="about-section"
          aria-labelledby="about-heading"
        >
          <div className="about-inner page-width">
            <figure className="interior-photo-panel">
              <ResponsivePhoto
                asset="interior"
                alt="صورة حقيقية لداخل فرع درة العنب: الألوان الخضراء والشعار ومنطقة الاستقبال والتقديم"
                sizes="(max-width: 650px) calc(100vw - 40px), 450px"
              />
              <a
                className="interior-expand"
                href={brand.assets.interiorOriginal}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فتح صورة داخل الفرع الأصلية كاملة"
              >
                <Expand size={18} aria-hidden="true" />
              </a>
              <figcaption>
                داخل أحد فروعنا — صورة حقيقية تُعرّف بالطابع المشترك للفروع.
              </figcaption>
            </figure>
            <div className="about-copy">
              <span className="eyebrow">
                <span className="small-rule" /> عن درة العنب
              </span>
              <h2 id="about-heading">
                أخضر على الواجهة.
                <br />
                درة العنب في الذاكرة.
              </h2>
              <p>
                لوحة خضراء، واسم أبيض، وشعار يحمل عبارة «طازج يومياً». هذه ملامح
                درة العنب التي تجمع فروعنا، وتظهر في صور واجهاتنا الحقيقية.
              </p>
              <p>
                ويمتد طابعنا إلى الداخل: ألوان خضراء، وشعار درة العنب، ومنطقة
                استقبال وتقديم. الصورة لداخل أحد الفروع؛ وبحسب صاحب العلامة،
                تتشابه الفروع في هذا التصميم.
              </p>
              <p>
                ورق عنب وملفوف كلاسيك وسبايسي، فتة ورق عنب، كبة ومحاشي؛ أصنافنا،
                تحت اسم واحد وهوية بصرية مشتركة.
              </p>
              <a href="#branches" className="text-link">
                شاهد طابع واجهاتنا <ArrowUpLeft size={19} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          id="branches"
          className="branches-section page-width section-space"
          aria-labelledby="branches-heading"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="small-rule" /> فروعنا
              </span>
              <h2 id="branches-heading">
                {formatArabicNumber(branches.length)} فروع.
                <br />
                <span className="soft-text">هوية تعرفونها.</span>
              </h2>
            </div>
            <p>
              طابع واحد يجمع واجهاتنا.
              <br />
              وصور حقيقية تعرّفكم به.
            </p>
          </div>
          <div className="branches-layout">
            <BranchGallery />
            <BranchDirectory />
          </div>
        </section>

        <section
          id="contact"
          className="contact-section"
          aria-labelledby="contact-heading"
        >
          <div className="contact-inner page-width">
            <div>
              <span className="eyebrow">لنبقى على تواصل</span>
              <h2 id="contact-heading">
                درة العنب،
                <br />
                أقرب إليكم.
              </h2>
              <p>
                نجهّز قناة التواصل عبر واتساب للأعمال.
                <br />
                يظهر الرابط هنا عند اعتماد الرقم وتفعيل القناة.
              </p>
            </div>
            <div className="contact-card">
              <span className="whatsapp-icon">
                <MessageCircle size={36} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>واتساب للأعمال</h3>
              <p>قناة التواصل القادمة لدرة العنب.</p>
              {whatsappUrl ? (
                <a
                  className="button button-lime"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  تواصل عبر واتساب <ArrowUpLeft size={18} />
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    className="button button-pending"
                    disabled
                  >
                    <span className="status-dot" /> قريباً — بعد اعتماد الرقم
                  </button>
                  <small>غير مفعّل حاليًا، ولا يتم إرسال أي رسائل.</small>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer page-width">
        <div className="footer-top">
          <a
            className="brand-lockup"
            href="#home"
            aria-label="العودة إلى الرئيسية"
          >
            <span className="logo-frame">
              <img
                src={brand.assets.logo}
                alt=""
                width="49"
                height="62"
                loading="lazy"
              />
            </span>
            <span className="brand-text">
              <strong>{brand.name}</strong>
              <small>{brand.tagline}</small>
            </span>
          </a>
          <nav aria-label="روابط أسفل الصفحة">
            <a href="#menu">أصنافنا</a>
            <a href="#about">عن درة العنب</a>
            <a href="#branches">فروعنا</a>
            <a href="#contact">تواصل معنا</a>
          </nav>
          <a className="back-to-top" href="#home">
            للأعلى <ArrowUpLeft size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {brand.copyrightYear} درة العنب. جميع الحقوق محفوظة.</span>
          <span className="preview-note">
            <span /> نسخة معاينة · الطلب الإلكتروني غير مفعّل
          </span>
        </div>
        <p className="integration-note">
          الربط بأودو أو فودكس وWhatsApp Business في مرحلة لاحقة؛ لا تكاملات
          خارجية فعّالة في هذه النسخة.
        </p>
      </footer>
      <MobileNav />
    </div>
  );
}
