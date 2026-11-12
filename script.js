/* ===== خودکار — اسکریپت اصلی (نسخه اصلاح‌شده) ===== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------
     فعال‌سازی کلاس js-enabled — فقط اگر JS واقعاً اجرا شود
     (برای اینکه انیمیشن مخفی‌سازی، محتوا را برای خزنده‌ها پنهان نکند)
  --------------------------------------------------------- */
  document.documentElement.classList.add('js-enabled');


  /* ---------------------------------------------------------
     ۱) سال جاری در فوتر
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ---------------------------------------------------------
     ۲) منوی موبایل
  --------------------------------------------------------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '✕' : '☰';
    });

    // بستن منو با کلیک روی هر لینک
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });

    // بستن منو با کلیک بیرون از آن
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.textContent = '☰';
        }
      }
    });
  }


  /* ---------------------------------------------------------
     ۳) نمایش پیام موفقیت پس از بازگشت از Web3Forms
  --------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');
  const errorBox = document.getElementById('formError');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === '1') {
    if (successBox) {
      successBox.hidden = false;
      // صبر تا layout تثبیت شود
      requestAnimationFrame(function () {
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    if (form) form.reset();

    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname + '#contactForm');
    }
  }


  /* ---------------------------------------------------------
     ۴) اعتبارسنجی سمت کاربر (قبل از ارسال به Web3Forms)
  --------------------------------------------------------- */
  function showError(msg) {
    if (!errorBox) {
      alert(msg);
      return;
    }
    errorBox.textContent = '⚠️ ' + msg;
    errorBox.hidden = false;
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearError() {
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = '';
    }
  }

  if (form) {
    const nameInput  = form.querySelector('#name');
    const phoneInput = form.querySelector('#phone');
    const emailInput = form.querySelector('#email');

    [nameInput, phoneInput, emailInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', clearError);
    });

    form.addEventListener('submit', function (e) {
      clearError();

      // --- نام ---
      const name = (nameInput?.value || '').trim();
      if (name.length < 3) {
        e.preventDefault();
        showError('لطفاً نام و نام خانوادگی خود را کامل وارد کنید (حداقل ۳ حرف).');
        nameInput?.focus();
        return;
      }

      // --- شماره تماس ---
      const phone = (phoneInput?.value || '').trim();
      const phoneDigits = phone.replace(/[^\d۰-۹+]/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        e.preventDefault();
        showError('لطفاً شماره تماس معتبر وارد کنید (مثال: ۰۹۱۲۴۹۱۷۸۲۲).');
        phoneInput?.focus();
        return;
      }

      // --- ایمیل (اختیاری) ---
      if (emailInput && emailInput.value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          e.preventDefault();
          showError('لطفاً ایمیل را به شکل صحیح وارد کنید (مثال: you@example.com).');
          emailInput.focus();
          return;
        }
      }

      // اگر همه‌چیز درست بود:
      // ❌ هیچ preventDefault ای صدا زده نمی‌شود
      // ✅ فرم به‌طور طبیعی ارسال می‌شود
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'در حال ارسال...';

        // اگر بعد از ۱۰ ثانیه صفحه ترک نشد، دکمه را دوباره فعال کن
        setTimeout(function () {
          if (document.body.contains(submitBtn)) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'ارسال و رزرو جلسه';
          }
        }, 10000);
      }
    });
  }


  /* ---------------------------------------------------------
     ۵) انیمیشن ظاهر شدن کارت‌ها هنگام اسکرول
        (با کلاس is-visible — محتوا هرگز در CSS مخفی نمی‌ماند
         مگر اینکه js-enabled فعال شده باشد)
  --------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .steps li').forEach(function (el) {
      observer.observe(el);
    });
  }

});