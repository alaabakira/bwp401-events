// =========================================================
// main.js: كود JavaScript المشترك بين كل الصفحات
// يعتمد على المصفوفتين events و categories الموجودتين في data.js
// لذلك لازم يكون data.js مضاف قبل هذا الملف في الـ HTML
// =========================================================


// ================= 1) دوال مساعدة عامة =================

// أسماء الأشهر والأيام بالعربي (أسماء الأشهر الشامية)
const monthNames = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
];
const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// تحويل نص التاريخ "2026-11-06" إلى كائن Date
// نقسم النص بأنفسنا بدل new Date("2026-11-06") لأن الأخيرة تعتبره توقيت UTC وقد يتغير اليوم
function parseDate(dateText) {
  const parts = dateText.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1; // الأشهر في JavaScript تبدأ من 0
  const day = Number(parts[2]);
  return new Date(year, month, day);
}

// تاريخ اليوم بنفس صيغة البيانات YYYY-MM-DD حتى نقدر نقارن النصوص مباشرة
function getTodayText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 3 تصبح "03"
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// تنسيق التاريخ للعرض: "الجمعة 6 تشرين الثاني 2026"
function formatDate(dateText) {
  const date = parseDate(dateText);
  return `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// عدد الأيام بين اليوم وتاريخ الفعالية (0 = اليوم، 1 = غداً، سالب = انتهت)
function daysUntil(dateText) {
  const oneDay = 1000 * 60 * 60 * 24; // عدد الميلي ثانية في اليوم
  const difference = parseDate(dateText) - parseDate(getTodayText());
  return Math.round(difference / oneDay);
}

// نص عربي مناسب لعدد الأيام (مع مراعاة قواعد العدد)
function daysLabel(days) {
  if (days === 0) return "اليوم";
  if (days === 1) return "غداً";
  if (days === 2) return "بعد يومين";
  if (days <= 10) return `بعد ${days} أيام`;
  return `بعد ${days} يوماً`;
}

// جلب معلومات التصنيف (المفتاح والأيقونة) من اسمه العربي
function getCategory(name) {
  const found = categories.find(function (category) {
    return category.name === name;
  });
  // إذا ما لقيناه نرجع قيمة افتراضية حتى ما يصير خطأ
  return found || { name: name, key: "culture", icon: "bi-tag" };
}

// ترتيب الفعاليات حسب التاريخ من الأقرب للأبعد
// slice() تعمل نسخة حتى لا نغيّر ترتيب المصفوفة الأصلية
function sortByDate(list) {
  return list.slice().sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });
}

// الفعاليات القادمة فقط (اليوم أو بعده) مرتبة حسب التاريخ
// المقارنة بين نصوص YYYY-MM-DD تعمل صح لأن السنة ثم الشهر ثم اليوم
function getUpcomingEvents() {
  const today = getTodayText();
  const upcoming = events.filter(function (event) {
    return event.date >= today;
  });
  return sortByDate(upcoming);
}

// حفظ وقراءة الإعدادات من localStorage
// نستعمل try/catch لأن بعض المتصفحات تمنع التخزين (مثل التصفح الخاص)
function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // إذا فشل الحفظ نكمل عادي، الموقع يشتغل بدونه
  }
}

function loadSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}


// ================= 2) بطاقة الفعالية =================

// ترجع كود HTML لبطاقة Bootstrap واحدة، نستعملها بالرئيسية وصفحة الفعاليات والفعاليات ذات الصلة
function createEventCard(event) {
  const category = getCategory(event.category);
  const date = parseDate(event.date);
  const link = `event.html?id=${event.id}`;

  return `
    <article class="card event-card cat-${category.key}">
      <div class="event-card-media">
        <a href="${link}" class="media-frame" tabindex="-1" aria-hidden="true">
          <img src="${event.image}" alt="${event.title}" loading="lazy">
        </a>
        <span class="badge cat-badge on-image"><i class="bi ${category.icon}"></i>${category.name}</span>
        <div class="date-tile">
          <span class="date-day">${date.getDate()}</span>
          <span class="date-month">${monthNames[date.getMonth()]}</span>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title"><a href="${link}">${event.title}</a></h3>
        <ul class="event-meta">
          <li><i class="bi bi-geo-alt"></i>${event.location}</li>
          <li><i class="bi bi-clock"></i>${dayNames[date.getDay()]} · ${event.time}</li>
        </ul>
        <p class="card-text">${event.short}</p>
        <div class="card-actions">
          <a href="${link}" class="btn btn-details">التفاصيل <i class="bi bi-arrow-left"></i></a>
        </div>
      </div>
    </article>
  `;
}

// عرض مجموعة بطاقات داخل عنصر، كل بطاقة داخل عمود من Bootstrap Grid
// columnClass يحدد عرض العمود حسب حجم الشاشة
function renderCards(list, container, columnClass) {
  const html = list.map(function (event) {
    return `<div class="${columnClass}">${createEventCard(event)}</div>`;
  });
  container.innerHTML = html.join("");
}


// ================= 3) ميزات مشتركة لكل الصفحات =================

// الوضع الليلي: نضيف/نشيل الصنف dark-mode على body ونحفظ الاختيار
function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  // data-bs-theme تخلي مكوّنات Bootstrap (المودال، الحقول...) تتحول للغامق كمان
  document.documentElement.setAttribute("data-bs-theme", isDark ? "dark" : "light");

  const button = document.getElementById("themeToggle");
  if (button) {
    button.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
    button.setAttribute("aria-label", isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي");
  }
}

function initThemeToggle() {
  // نطبّق الاختيار المحفوظ من الزيارة السابقة
  applyTheme(loadSetting("theme") === "dark");

  const button = document.getElementById("themeToggle");
  if (!button) return;

  button.addEventListener("click", function () {
    const isDark = !document.body.classList.contains("dark-mode");
    applyTheme(isDark);
    saveSetting("theme", isDark ? "dark" : "light");
  });
}

// زر الرجوع للأعلى + ظل الهيدر عند النزول
function initScrollEffects() {
  const button = document.getElementById("scrollTopBtn");
  const header = document.querySelector(".site-header");

  window.addEventListener("scroll", function () {
    const scrolled = window.scrollY;
    if (button) button.classList.toggle("show", scrolled > 400);
    if (header) header.classList.toggle("scrolled", scrolled > 10);
  });

  if (button) {
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}


// ================= 4) الصفحة الرئيسية index.html =================

function initHomePage() {
  renderHeroStats();
  renderTodayEvent();
  renderFeaturedCarousel();
  renderCategoryTiles();
  renderLatestEvents();
}

// أرقام سريعة تحت عنوان الترحيب
function renderHeroStats() {
  const thisWeek = getUpcomingEvents().filter(function (event) {
    return daysUntil(event.date) <= 7;
  });
  document.getElementById("statEvents").textContent = events.length;
  document.getElementById("statCategories").textContent = categories.length;
  document.getElementById("statWeek").textContent = thisWeek.length;
}

// بطاقة "فعالية اليوم": إذا في فعالية اليوم نعرضها، وإلا نعرض أقرب فعالية قادمة
function renderTodayEvent() {
  const container = document.getElementById("todayEvent");
  const today = getTodayText();
  const upcoming = getUpcomingEvents();

  const todayEvents = events.filter(function (event) {
    return event.date === today;
  });

  let event;
  let status;

  if (todayEvents.length > 0) {
    event = todayEvents[0];
    status = "يحدث اليوم";
  } else if (upcoming.length > 0) {
    event = upcoming[0];
    status = "الفعالية القادمة";
  } else {
    // كل الفعاليات انتهت: نعرض آخر واحدة
    const sorted = sortByDate(events);
    event = sorted[sorted.length - 1];
    status = "آخر فعالية";
  }

  const category = getCategory(event.category);
  const days = daysUntil(event.date);
  const whenText = days >= 0 ? daysLabel(days) : "انتهت";

  container.innerHTML = `
    <article class="today-card cat-${category.key}">
      <div class="today-media">
        <img src="${event.image}" alt="${event.title}">
        <span class="today-status"><span class="pulse-dot"></span>${status}</span>
      </div>
      <div class="today-body">
        <span class="badge cat-badge"><i class="bi ${category.icon}"></i>${category.name}</span>
        <h2 class="today-title"><a href="event.html?id=${event.id}">${event.title}</a></h2>
        <p class="text-muted-soft small mb-0"><i class="bi bi-geo-alt"></i> ${event.location}</p>
      </div>
      <div class="ticket-cut"></div>
      <div class="today-footer">
        <div class="today-when">
          ${whenText}
          <small>${formatDate(event.date)} · ${event.time}</small>
        </div>
        <a href="event.html?id=${event.id}" class="btn btn-brand btn-sm">التفاصيل</a>
      </div>
    </article>
  `;
}

// اختيار فعاليات السلايدر: فعاليات الأسبوع القادم، وإذا كانت قليلة نكمل من الأقرب
function getFeaturedEvents() {
  const upcoming = getUpcomingEvents();
  const thisWeek = upcoming.filter(function (event) {
    return daysUntil(event.date) <= 7;
  });

  if (thisWeek.length >= 3) return thisWeek.slice(0, 5);
  if (upcoming.length > 0) return upcoming.slice(0, 4);
  return events.slice(0, 4); // احتياط إذا انتهت كل الفعاليات
}

// بناء شرائح Bootstrap Carousel من البيانات
function renderFeaturedCarousel() {
  const featured = getFeaturedEvents();
  const inner = document.getElementById("featuredInner");
  const indicators = document.getElementById("featuredIndicators");

  // map ترجع مصفوفة من أكواد HTML، و index يفيدنا لتمييز أول شريحة بـ active
  const slides = featured.map(function (event, index) {
    const category = getCategory(event.category);
    const date = parseDate(event.date);
    const activeClass = index === 0 ? "active" : "";

    return `
      <div class="carousel-item ${activeClass}">
        <div class="featured-slide cat-${category.key}">
          <div class="featured-media">
            <img src="${event.image}" alt="${event.title}">
          </div>
          <div class="featured-body">
            <span class="badge cat-badge"><i class="bi ${category.icon}"></i>${category.name}</span>
            <p class="featured-date">
              <span class="day-num">${date.getDate()}</span>
              <span>${monthNames[date.getMonth()]}<br>${dayNames[date.getDay()]} · ${event.time}</span>
            </p>
            <h3 class="featured-title">${event.title}</h3>
            <p class="featured-text">${event.short}</p>
            <p class="featured-place"><i class="bi bi-geo-alt-fill"></i> ${event.location}</p>
            <a href="event.html?id=${event.id}" class="btn btn-brand">اعرف المزيد</a>
          </div>
        </div>
      </div>
    `;
  });

  // أزرار المؤشرات الصغيرة (واحد لكل شريحة)
  const dots = featured.map(function (event, index) {
    const activeAttributes = index === 0 ? 'class="active" aria-current="true"' : "";
    return `<button type="button" data-bs-target="#featuredCarousel" data-bs-slide-to="${index}" ${activeAttributes} aria-label="الشريحة ${index + 1}"></button>`;
  });

  inner.innerHTML = slides.join("");
  indicators.innerHTML = dots.join("");
}

// بلاطات التصنيفات السريعة مع عدد الفعاليات بكل تصنيف
function renderCategoryTiles() {
  const container = document.getElementById("categoryTiles");
  const remembered = loadSetting("lastCategory");

  const tiles = categories.map(function (category) {
    const count = events.filter(function (event) {
      return event.category === category.name;
    }).length;
    const badge = category.name === remembered ? '<span class="tile-remembered">آخر اختيار</span>' : "";

    // encodeURIComponent تحوّل النص العربي لصيغة آمنة داخل الرابط
    return `
      <a class="category-tile cat-${category.key}" href="events.html?category=${encodeURIComponent(category.name)}">
        ${badge}
        <span class="tile-icon"><i class="bi ${category.icon}"></i></span>
        <span>
          <span class="tile-name d-block">${category.name}</span>
          <span class="tile-count">${count} فعاليات</span>
        </span>
      </a>
    `;
  });

  // بلاطة إضافية لعرض كل الفعاليات
  tiles.push(`
    <a class="category-tile tile-all" href="events.html">
      <span class="tile-icon"><i class="bi bi-grid"></i></span>
      <span>
        <span class="tile-name d-block">الكل</span>
        <span class="tile-count">${events.length} فعالية</span>
      </span>
    </a>
  `);

  container.innerHTML = tiles.join("");
}

// شبكة "أحدث الفعاليات": أقرب 6 فعاليات قادمة
function renderLatestEvents() {
  const upcoming = getUpcomingEvents();
  // إذا كانت الفعاليات القادمة أقل من 6 نعرض كل الفعاليات مرتبة
  const list = upcoming.length >= 6 ? upcoming : sortByDate(events);
  renderCards(list.slice(0, 6), document.getElementById("latestGrid"), "col-sm-6 col-lg-4");
}


// ================= 5) صفحة كل الفعاليات events.html =================

function initEventsPage() {
  const categorySelect = document.getElementById("categoryFilter");
  const locationSelect = document.getElementById("locationFilter");

  // تعبئة قائمة التصنيفات من البيانات
  categories.forEach(function (category) {
    categorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
  });

  // تعبئة قائمة الأماكن بدون تكرار: new Set تحذف القيم المكررة
  const locations = [...new Set(events.map(function (event) {
    return event.location;
  }))];
  locations.forEach(function (location) {
    locationSelect.innerHTML += `<option value="${location}">${location}</option>`;
  });

  renderFilterChips();

  // التصنيف الأولي: من الرابط ?category= أولاً، وإلا آخر تصنيف محفوظ
  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get("category");
  const savedCategory = loadSetting("lastCategory");

  if (urlCategory && isValidCategory(urlCategory)) {
    categorySelect.value = urlCategory;
  } else if (savedCategory && isValidCategory(savedCategory)) {
    categorySelect.value = savedCategory;
  }

  // أي تغيير بأي حقل يعيد الفلترة مباشرة
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  locationSelect.addEventListener("change", applyFilters);
  document.getElementById("dateFrom").addEventListener("change", applyFilters);
  document.getElementById("dateTo").addEventListener("change", applyFilters);
  categorySelect.addEventListener("change", function () {
    saveSetting("lastCategory", categorySelect.value);
    applyFilters();
  });

  document.getElementById("resetFilters").addEventListener("click", resetFilters);
  document.getElementById("emptyReset").addEventListener("click", resetFilters);

  applyFilters();
}

function isValidCategory(name) {
  return categories.some(function (category) {
    return category.name === name;
  });
}

// أزرار التصنيف السريعة فوق النتائج (مربوطة مع قائمة التصنيف)
function renderFilterChips() {
  const container = document.getElementById("filterChips");
  let html = `<button type="button" class="chip" data-category="">الكل</button>`;

  categories.forEach(function (category) {
    html += `<button type="button" class="chip cat-${category.key}" data-category="${category.name}">
      <i class="bi ${category.icon}"></i>${category.name}</button>`;
  });
  container.innerHTML = html;

  // عند الضغط على زر: نغيّر قيمة القائمة ونعيد الفلترة
  container.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      const categorySelect = document.getElementById("categoryFilter");
      categorySelect.value = chip.dataset.category;
      saveSetting("lastCategory", chip.dataset.category);
      applyFilters();
    });
  });
}

// قلب صفحة الفعاليات: نقرأ كل الحقول ونفلتر المصفوفة
function applyFilters() {
  const searchText = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const location = document.getElementById("locationFilter").value;
  const dateFrom = document.getElementById("dateFrom").value; // "" أو "YYYY-MM-DD"
  const dateTo = document.getElementById("dateTo").value;

  // ما نسمح بتاريخ نهاية قبل تاريخ البداية
  document.getElementById("dateTo").min = dateFrom;

  const results = events.filter(function (event) {
    // البحث بالعنوان أو الوصف القصير أو المكان
    const text = `${event.title} ${event.short} ${event.location}`.toLowerCase();
    const matchesSearch = searchText === "" || text.includes(searchText);

    // إذا الحقل فاضي يعني "الكل" فالشرط يتحقق دائماً
    const matchesCategory = category === "" || event.category === category;
    const matchesLocation = location === "" || event.location === location;
    const matchesFrom = dateFrom === "" || event.date >= dateFrom;
    const matchesTo = dateTo === "" || event.date <= dateTo;

    return matchesSearch && matchesCategory && matchesLocation && matchesFrom && matchesTo;
  });

  const sortedResults = sortByDate(results);
  renderCards(sortedResults, document.getElementById("eventsGrid"), "col-sm-6 col-lg-4");

  // عدّاد النتائج
  document.getElementById("resultsCount").innerHTML =
    `عرض <span>${sortedResults.length}</span> من ${events.length} فعالية`;

  // رسالة "لا توجد نتائج" تظهر فقط إذا المصفوفة فاضية
  document.getElementById("noResults").classList.toggle("d-none", sortedResults.length > 0);

  // تمييز زر التصنيف الفعّال
  document.querySelectorAll("#filterChips .chip").forEach(function (chip) {
    chip.classList.toggle("active", chip.dataset.category === category);
  });
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("categoryFilter").value = "";
  document.getElementById("locationFilter").value = "";
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  saveSetting("lastCategory", "");
  applyFilters();
}


// ================= 6) صفحة تفاصيل الفعالية event.html =================

function initEventPage() {
  // نقرأ رقم الفعالية من الرابط، مثال: event.html?id=3
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  const event = events.find(function (item) {
    return item.id === id;
  });

  // إذا الرقم غلط أو مفقود نعرض رسالة بدل صفحة فاضية
  if (!event) {
    document.getElementById("notFound").classList.remove("d-none");
    document.title = "الفعالية غير موجودة | دليل فعاليات الجامعة الافتراضية";
    return;
  }

  renderEventDetails(event);
  renderGallery(event);
  renderRelatedEvents(event);
  initBookingForm(event);

  document.getElementById("calendarBtn").addEventListener("click", function () {
    downloadCalendarFile(event);
  });
  document.getElementById("shareBtn").addEventListener("click", function () {
    shareEvent(event);
  });

  // نُظهر أقسام التفاصيل (كانت مخفية حتى نتأكد من وجود الفعالية)
  document.querySelectorAll(".event-section").forEach(function (section) {
    section.classList.remove("d-none");
  });
}

function renderEventDetails(event) {
  const category = getCategory(event.category);

  document.title = `${event.title} | دليل فعاليات الجامعة الافتراضية`;

  // نضيف صنف التصنيف على main حتى تأخذ كل العناصر لون التصنيف
  document.querySelector("main").classList.add(`cat-${category.key}`);

  // textContent أأمن من innerHTML للنصوص العادية
  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("breadcrumbTitle").textContent = event.title;
  document.getElementById("eventCategory").innerHTML = `<i class="bi ${category.icon}"></i>${category.name}`;
  document.getElementById("eventDate").textContent = formatDate(event.date);
  document.getElementById("eventTime").textContent = event.time;
  document.getElementById("eventLocation").textContent = event.location;
  document.getElementById("eventDescription").textContent = event.description;

  // بطاقة المعلومات الجانبية
  document.getElementById("infoDate").textContent = formatDate(event.date);
  document.getElementById("infoTime").textContent = `${event.time} (المدة التقريبية ساعتان)`;
  document.getElementById("infoLocation").textContent = event.location;
  document.getElementById("infoCategory").textContent = event.category;

  const days = daysUntil(event.date);
  document.getElementById("infoCountdown").textContent = days >= 0 ? daysLabel(days) : "انتهت هذه الفعالية";

  // الخريطة: صورة ثابتة + رابط يفتح المكان على خرائط Google
  document.getElementById("mapLabel").textContent = event.location;
  document.getElementById("mapLink").href =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + " دمشق")}`;
}

// المعرض: صورة كبيرة + صور مصغّرة، الضغط على المصغّرة يبدّل الصورة الكبيرة
function renderGallery(event) {
  const mainImage = document.getElementById("eventImage");
  const container = document.getElementById("eventGallery");
  const images = [event.image].concat(event.gallery);

  mainImage.src = event.image;
  mainImage.alt = event.title;

  container.innerHTML = images.map(function (src, index) {
    const activeClass = index === 0 ? "active" : "";
    return `<button type="button" class="gallery-thumb ${activeClass}" data-src="${src}" aria-label="عرض الصورة ${index + 1}">
      <img src="${src}" alt="" loading="lazy"></button>`;
  }).join("");

  container.querySelectorAll(".gallery-thumb").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      mainImage.src = thumb.dataset.src;
      container.querySelectorAll(".gallery-thumb").forEach(function (other) {
        other.classList.remove("active");
      });
      thumb.classList.add("active");
    });
  });
}

// فعاليات ذات صلة: نفس التصنيف ما عدا الفعالية الحالية
function renderRelatedEvents(event) {
  const related = events.filter(function (item) {
    return item.category === event.category && item.id !== event.id;
  });

  const container = document.getElementById("relatedGrid");
  if (related.length === 0) {
    container.innerHTML = '<p class="text-muted-soft">لا توجد فعاليات أخرى في هذا التصنيف حالياً.</p>';
    return;
  }
  renderCards(sortByDate(related).slice(0, 3), container, "col-md-6 col-lg-4");
}

// زر "أضف للتقويم": ننشئ ملف .ics (صيغة يفهمها Google Calendar و Outlook وتقويم الجوال)
function downloadCalendarFile(event) {
  const start = event.date.replaceAll("-", "") + "T" + event.time.replace(":", "") + "00"; // 20261106T200000
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; // وقت إنشاء الملف

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SVU Events Guide//AR",
    "BEGIN:VEVENT",
    `UID:svu-event-${event.id}@events-guide`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    "DURATION:PT2H",
    `SUMMARY:${escapeCalendarText(event.title)}`,
    `LOCATION:${escapeCalendarText(event.location)}`,
    `DESCRIPTION:${escapeCalendarText(event.short)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  // Blob = ملف ننشئه داخل المتصفح، ثم نعمل رابط مؤقت له ونضغط عليه برمجياً
  const file = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `event-${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url); // نحرّر الذاكرة بعد التحميل
  }, 1000);

  showToast("تم تجهيز ملف التقويم، افتحه لإضافة الفعالية إلى تقويمك.");
}

// صيغة ics تعتبر الفاصلة والفاصلة المنقوطة رموزاً خاصة، فنضع قبلها \
function escapeCalendarText(text) {
  return text.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

// زر "شارك": نستخدم قائمة المشاركة بالجوال إن وجدت، وإلا ننسخ الرابط
function shareEvent(event) {
  const shareData = {
    title: event.title,
    text: event.short,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(function () {
      // المستخدم أغلق قائمة المشاركة، ما في داعي نعمل شي
    });
  } else {
    copyLink(shareData.url);
  }
}

function copyLink(url) {
  // النسخ التلقائي يحتاج اتصال آمن (https)، وإلا نعرض الرابط لينسخه المستخدم بنفسه
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url)
      .then(function () {
        showToast("تم نسخ رابط الفعالية، يمكنك لصقه وإرساله لأصدقائك.");
      })
      .catch(function () {
        showManualCopy(url);
      });
  } else {
    showManualCopy(url);
  }
}

function showManualCopy(url) {
  const box = document.getElementById("shareFallback");
  const input = document.getElementById("shareUrl");
  input.value = url;
  box.classList.remove("d-none");
  input.focus();
  input.select();
}

// رسالة صغيرة مؤقتة باستخدام Bootstrap Toast
function showToast(message) {
  const toastElement = document.getElementById("siteToast");
  if (!toastElement) return;
  document.getElementById("toastMessage").textContent = message;
  bootstrap.Toast.getOrCreateInstance(toastElement).show();
}

// نموذج الحجز الوهمي داخل Bootstrap Modal
function initBookingForm(event) {
  const form = document.getElementById("bookingForm");
  const modalElement = document.getElementById("bookingModal");
  const success = document.getElementById("bookingSuccess");

  document.getElementById("bookingEventTitle").textContent = event.title;

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // نمنع إعادة تحميل الصفحة

    const nameInput = document.getElementById("bookingName");
    const emailInput = document.getElementById("bookingEmail");

    const nameOk = nameInput.value.trim().length >= 3;
    const emailOk = isValidEmail(emailInput.value.trim());

    setFieldState(nameInput, nameOk);
    setFieldState(emailInput, emailOk);

    if (!nameOk || !emailOk) return;

    // رقم حجز عشوائي من 4 أرقام للعرض فقط
    const bookingNumber = Math.floor(1000 + Math.random() * 9000);
    const seats = document.getElementById("bookingSeats").value;
    document.getElementById("bookingNumber").textContent = `SVU-${bookingNumber}`;
    document.getElementById("bookingSeatsText").textContent = seats;

    form.classList.add("d-none");
    success.classList.remove("d-none");
  });

  // عند إغلاق المودال نرجّع النموذج لحالته الأولى
  modalElement.addEventListener("hidden.bs.modal", function () {
    form.reset();
    clearFieldStates(form);
    form.classList.remove("d-none");
    success.classList.add("d-none");
  });
}


// ================= 7) التحقق من النماذج (contact + booking) =================

// صيغة بريد بسيطة: نص ثم @ ثم نص ثم نقطة ثم نص، بدون فراغات
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// تلوين الحقل باستخدام أصناف Bootstrap: is-valid (أخضر) أو is-invalid (أحمر)
function setFieldState(input, isValid) {
  input.classList.toggle("is-valid", isValid);
  input.classList.toggle("is-invalid", !isValid);
}

function clearFieldStates(form) {
  form.querySelectorAll(".is-valid, .is-invalid").forEach(function (input) {
    input.classList.remove("is-valid", "is-invalid");
  });
}

// إنشاء Bootstrap Alert قابل للإغلاق
// نستعمل textContent للرسالة حتى لا يتنفذ أي كود يكتبه المستخدم
function showAlert(container, type, iconClass, message) {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show d-flex gap-2 align-items-start`;
  alert.setAttribute("role", "alert");

  const icon = document.createElement("i");
  icon.className = `bi ${iconClass} mt-1`;

  const text = document.createElement("div");
  text.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn-close";
  closeButton.setAttribute("data-bs-dismiss", "alert");
  closeButton.setAttribute("aria-label", "إغلاق");

  alert.append(icon, text, closeButton);
  container.innerHTML = ""; // نشيل أي رسالة قديمة
  container.appendChild(alert);
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const alertBox = document.getElementById("formAlert");
  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const messageInput = document.getElementById("contactMessage");

  // دالة تتحقق من كل حقل وترجع true إذا كان صحيحاً
  function checkName() {
    const ok = nameInput.value.trim().length >= 3;
    setFieldState(nameInput, ok);
    return ok;
  }
  function checkEmail() {
    const ok = isValidEmail(emailInput.value.trim());
    setFieldState(emailInput, ok);
    return ok;
  }
  function checkMessage() {
    const ok = messageInput.value.trim().length >= 10;
    setFieldState(messageInput, ok);
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // نستدعي الثلاث دوال كلها (حتى يتلون كل حقل غلط، مو بس أول واحد)
    const nameOk = checkName();
    const emailOk = checkEmail();
    const messageOk = checkMessage();

    if (nameOk && emailOk && messageOk) {
      const name = nameInput.value.trim();
      showAlert(alertBox, "success", "bi-check-circle-fill",
        `شكراً ${name}! وصلتنا رسالتك وسنرد عليك خلال يومي عمل.`);
      form.reset();
      clearFieldStates(form);
    } else {
      showAlert(alertBox, "danger", "bi-exclamation-triangle-fill",
        "لم يتم الإرسال. يرجى تصحيح الحقول المظللة باللون الأحمر ثم المحاولة مجدداً.");
    }

    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // بعد أول محاولة: إذا كان الحقل أحمر نعيد فحصه أثناء الكتابة حتى يتحول للأخضر فوراً
  nameInput.addEventListener("input", function () {
    if (nameInput.classList.contains("is-invalid")) checkName();
  });
  emailInput.addEventListener("input", function () {
    if (emailInput.classList.contains("is-invalid")) checkEmail();
  });
  messageInput.addEventListener("input", function () {
    if (messageInput.classList.contains("is-invalid")) checkMessage();
  });
}


// ================= 8) التشغيل =================
// نفس الملف يُحمّل بكل الصفحات، فنشغّل كود كل صفحة فقط إذا عناصرها موجودة

initThemeToggle();
initScrollEffects();

if (document.getElementById("featuredCarousel")) initHomePage();
if (document.getElementById("eventsGrid")) initEventsPage();
if (document.getElementById("eventPage")) initEventPage();
if (document.getElementById("contactForm")) initContactForm();
