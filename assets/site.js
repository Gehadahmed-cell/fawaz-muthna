(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- سنة الحقوق --- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- قائمة الجوال --- */
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobile-nav');

  // هذا الملف مشترك بين الصفحة الرئيسية وصفحات الخدمات، وليست كل العناصر
  // موجودة في كل صفحة — لذلك كل كتلة محروسة بفحص وجود عنصرها.
  if (burger && mobileNav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      mobileNav.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
    };

    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* --- حالة الهيدر + زر العودة للأعلى --- */
  var header = document.getElementById('header');
  var toTop = document.getElementById('to-top');

  if (header || toTop) {
    var onScroll = function () {
      var y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 24);
      if (toTop) toTop.classList.toggle('is-visible', y > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* --- الظهور التدريجي --- */
  var reveals = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* --- إبراز رابط القسم النشط --- */
  // في صفحات الخدمات تشير روابط التنقل إلى ../index.html#… وليست محدّدات CSS،
  // لذلك نقتصر على الروابط الداخلية التي تبدأ بـ #
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'))
    .filter(function (a) { return (a.getAttribute('href') || '').charAt(0) === '#'; });
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* --- نموذج الطلب عبر الواتساب --- */
  var form = document.getElementById('request-form');
  var WHATSAPP_NUMBER = '967777181933';

  function setError(fieldId, hasError) {
    var field = document.getElementById(fieldId);
    if (field) field.classList.toggle('has-error', hasError);
    return hasError;
  }

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var service = document.getElementById('service').value;
    var city = document.getElementById('city').value.trim();
    var message = document.getElementById('message').value.trim();

    // رقم يمني: 9 خانات تبدأ بـ 7، مع تجاهل المسافات والرموز والمفتاح الدولي
    var digits = phone.replace(/\D/g, '').replace(/^(00967|967)/, '');
    var invalid = false;

    invalid = setError('field-name', name.length < 2) || invalid;
    invalid = setError('field-phone', !/^7\d{8}$/.test(digits)) || invalid;
    invalid = setError('field-message', message.length < 5) || invalid;

    if (invalid) {
      var firstBad = form.querySelector('.has-error input, .has-error textarea');
      if (firstBad) firstBad.focus();
      return;
    }

    var lines = [
      'مرحباً مؤسسة فواز مثنى، لديّ طلب جديد:',
      '',
      '• الاسم: ' + name,
      '• الهاتف: ' + digits,
      '• الخدمة: ' + service
    ];
    if (city) lines.push('• المدينة/الموقع: ' + city);
    lines.push('• التفاصيل: ' + message);

    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  });

  // إزالة رسالة الخطأ فور بدء التصحيح
  ['name', 'phone', 'message'].forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', function () {
      var field = input.closest('.field');
      if (field) field.classList.remove('has-error');
    });
  });
})();
