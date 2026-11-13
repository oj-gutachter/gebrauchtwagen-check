/* Texte nur für die native App (iPhone/iPad, Android). Die Web-Testversion bleibt unverändert.
   In der App gibt es kein Testversion-Schild, und die Datenschutzseite beschreibt den Speicher der App auf dem Gerät. */
(function () {
  'use strict';
  let native = false;
  try { native = !!(window.Capacitor && typeof Capacitor.isNativePlatform === 'function' && Capacitor.isNativePlatform()); } catch (error) { native = false; }
  if (!native || typeof OJ_TRANSLATIONS === 'undefined') return;
  window.OJ_NATIVE_APP = true;
  document.documentElement.classList.add('native-app');
  const T = {
    de: {
      eyebrow: 'Datenschutz · Hinweise',
      s0: ['Die Checkliste ist ohne Konto nutzbar. Sie enthält keine Werbung, kein Tracking und keine Analysewerkzeuge. Ihre Antworten und die Angaben unter „Mein Auto – Erinnerungen“ werden ausschließlich im Speicher dieser App auf Ihrem Gerät abgelegt und nicht automatisch an OJ Gutachter oder Dritte übertragen. Die App lädt keine externen Schriften, Bilder oder Skripte.',
           'Bei „Neuen Check starten“ werden die Antworten der Kauf-Checkliste gelöscht. Die Auto-Erinnerungen lassen sich dort über „Bearbeiten“ und „Alle Angaben zu Mein Auto löschen“ separat entfernen. Wenn Sie die App löschen, werden alle in der App gespeicherten Daten von Ihrem Gerät entfernt. Ausdrucke, PDF-Dateien und Sicherungsdateien liegen in Ihrem eigenen Verantwortungsbereich.'],
      s1: ['Die Termine und Kilometerstände werden nur auf Ihrem Gerät gespeichert. Mit „In Kalender eintragen“ legt die App den Termin nach Ihrer Erlaubnis mit Erinnerung in Ihrem Kalender an. Andere Kalendereinträge liest die App nicht. Ohne Erlaubnis können Sie stattdessen eine Kalenderdatei (.ics) speichern oder teilen. Für Termine in Ihrem Kalender gelten dessen Datenschutzregeln.'],
      loc: {title: 'Standort', paragraphs: ['Nur wenn Sie auf „Entfernung anzeigen“ tippen, fragt die App nach Ihrer Erlaubnis und nutzt Ihren ungefähren Standort. Daraus berechnet sie auf Ihrem Gerät die Entfernung zum Büro in Dortmund. Der Standort wird nicht gespeichert und nicht an OJ Gutachter oder Dritte gesendet.']},
      s5: 'Diese App begleitet einen Gebrauchtwagenkauf. Für die Meldung eines Unfallschadens nutzen Sie bitte den separaten OJ Schadenmelder auf der OJ-Website.'
    },
    en: {
      eyebrow: 'Privacy · Important information',
      s0: ['You can use the checklist without an account. It contains no advertising, tracking or analytics. Your answers and the details in “My car – reminders” are stored only in this app’s storage on your device and are not automatically sent to OJ Gutachter or third parties. The app loads no external fonts, images or scripts.',
           'Starting a new inspection deletes the answers from the purchase checklist. You can remove your car reminders separately via “Edit” and “Delete all My car details”. Deleting the app removes all data stored in the app from your device. Printouts, PDF files and backup files are your own responsibility.'],
      s1: ['Dates and mileage are stored only on your device. With “Add to calendar” the app adds the appointment with a reminder to your calendar after you allow it. The app does not read other calendar entries. Without permission you can save or share a calendar file (.ics) instead. Your calendar’s privacy rules apply to entries there.'],
      loc: {title: 'Location', paragraphs: ['Only when you tap the distance button does the app ask for permission and use your approximate location. It calculates the distance to the office in Dortmund on your device. Your location is not stored and not sent to OJ Gutachter or third parties.']},
      s5: 'This app guides you through buying a used car. To report accident damage, please use the separate OJ Schadenmelder on the OJ-Website.'
    },
    tr: {
      eyebrow: 'Gizlilik · Önemli bilgiler',
      s0: ['Kontrol listesini hesap açmadan kullanabilirsiniz. Reklam, izleme ve analiz aracı içermez. Cevaplarınız ve “Aracım – hatırlatıcılar” bilgileri yalnızca cihazınızda bu uygulamanın belleğinde tutulur; OJ Gutachter veya üçüncü taraflara otomatik aktarılmaz. Uygulama harici yazı tipi, resim veya betik yüklemez.',
           'Yeni bir kontrol başlattığınızda satın alma kontrol listesindeki cevaplar silinir. Araç hatırlatıcılarını “Düzenle” ve “Tüm Aracım bilgilerini sil” seçenekleriyle ayrıca kaldırabilirsiniz. Uygulamayı sildiğinizde uygulamada kayıtlı tüm veriler cihazınızdan kaldırılır. Yazdırılan belgeler, PDF dosyaları ve yedek dosyaları sizin sorumluluğunuzdadır.'],
      s1: ['Tarihler ve kilometreler yalnızca cihazınızda saklanır. “Takvime ekle” ile uygulama, izninizden sonra randevuyu hatırlatıcıyla birlikte takviminize ekler. Uygulama diğer takvim kayıtlarını okumaz. İzin vermezseniz bunun yerine bir takvim dosyası (.ics) kaydedebilir veya paylaşabilirsiniz. Takviminizdeki kayıtlar için takvimin gizlilik kuralları geçerlidir.'],
      loc: {title: 'Konum', paragraphs: ['Uygulama yalnızca mesafe düğmesine dokunduğunuzda izin ister ve yaklaşık konumunuzu kullanır. Dortmund’daki büroya olan mesafeyi cihazınızda hesaplar. Konumunuz kaydedilmez, OJ Gutachter’e veya üçüncü taraflara gönderilmez.']},
      s5: 'Bu uygulama ikinci el araç satın alırken size rehberlik eder. Kaza hasarını bildirmek için OJ-Website üzerindeki ayrı OJ Schadenmelder uygulamasını kullanın.'
    },
    ar: {
      eyebrow: 'الخصوصية · معلومات مهمة',
      s0: ['يمكنك استخدام قائمة الفحص دون حساب. لا تحتوي على إعلانات أو تتبع أو أدوات تحليل. تُحفظ إجاباتك وبيانات «سيارتي – التذكيرات» فقط في ذاكرة هذا التطبيق على جهازك ولا تُرسل تلقائيًا إلى OJ Gutachter أو أطراف أخرى. لا يحمّل التطبيق خطوطًا أو صورًا أو برامج خارجية.',
           'عند بدء فحص جديد تُحذف إجابات قائمة فحص الشراء. يمكنك حذف تذكيرات السيارة منفصلة عبر «تعديل» و«حذف جميع بيانات سيارتي». عند حذف التطبيق تُزال جميع البيانات المحفوظة فيه من جهازك. تقع مسؤولية المطبوعات وملفات PDF وملفات النسخ الاحتياطي عليك.'],
      s1: ['تُحفظ المواعيد وقراءات العداد على جهازك فقط. عبر «أضف إلى التقويم» يضيف التطبيق الموعد مع تذكير إلى تقويمك بعد موافقتك. لا يقرأ التطبيق مواعيد التقويم الأخرى. دون الموافقة يمكنك بدلًا من ذلك حفظ ملف تقويم (.ics) أو مشاركته. تنطبق قواعد الخصوصية الخاصة بالتقويم على المواعيد فيه.'],
      loc: {title: 'الموقع', paragraphs: ['لا يطلب التطبيق الإذن ولا يستخدم موقعك التقريبي إلا عندما تضغط على زر المسافة. يحسب المسافة إلى المكتب في دورتموند على جهازك. لا يُحفظ موقعك ولا يُرسل إلى OJ Gutachter أو أطراف أخرى.']},
      s5: 'يرشدك هذا التطبيق أثناء شراء سيارة مستعملة. للإبلاغ عن ضرر ناتج عن حادث، استخدم تطبيق OJ Schadenmelder المنفصل على OJ-Website.'
    },
    pl: {
      eyebrow: 'Prywatność · Ważne informacje',
      s0: ['Listy kontrolnej można używać bez konta. Nie zawiera reklam, śledzenia ani narzędzi analitycznych. Twoje odpowiedzi i dane z „Moje auto – przypomnienia” są zapisywane wyłącznie w pamięci tej aplikacji na Twoim urządzeniu i nie są automatycznie przesyłane do OJ Gutachter ani osób trzecich. Aplikacja nie pobiera zewnętrznych czcionek, obrazów ani skryptów.',
           'Rozpoczęcie nowej kontroli usuwa odpowiedzi z listy kontrolnej przed zakupem. Przypomnienia o aucie możesz usunąć osobno przez „Edytuj” i „Usuń wszystkie dane Mojego auta”. Usunięcie aplikacji usuwa z urządzenia wszystkie zapisane w niej dane. Za wydruki, pliki PDF i pliki kopii zapasowej odpowiadasz samodzielnie.'],
      s1: ['Terminy i przebiegi są zapisywane tylko na Twoim urządzeniu. Przyciskiem „Dodaj do kalendarza” aplikacja po Twojej zgodzie dodaje termin z przypomnieniem do kalendarza. Aplikacja nie odczytuje innych wpisów w kalendarzu. Bez zgody możesz zamiast tego zapisać lub udostępnić plik kalendarza (.ics). Dla wpisów w kalendarzu obowiązują jego zasady ochrony prywatności.'],
      loc: {title: 'Lokalizacja', paragraphs: ['Tylko gdy dotkniesz przycisku odległości, aplikacja prosi o zgodę i używa Twojej przybliżonej lokalizacji. Odległość do biura w Dortmundzie oblicza na Twoim urządzeniu. Lokalizacja nie jest zapisywana ani wysyłana do OJ Gutachter ani osób trzecich.']},
      s5: 'Ta aplikacja prowadzi przez zakup używanego auta. Aby zgłosić szkodę powypadkową, skorzystaj z oddzielnego OJ Schadenmelder na OJ-Website.'
    },
    ru: {
      eyebrow: 'Конфиденциальность · Важная информация',
      s0: ['Контрольным списком можно пользоваться без аккаунта. В нём нет рекламы, отслеживания и аналитики. Ваши ответы и сведения из «Мой автомобиль – напоминания» хранятся только в памяти этого приложения на вашем устройстве и не передаются автоматически в OJ Gutachter или третьим лицам. Приложение не загружает внешние шрифты, изображения и скрипты.',
           'При начале новой проверки ответы контрольного списка покупки удаляются. Напоминания об автомобиле можно удалить отдельно через «Редактировать» и «Удалить все данные моего автомобиля». При удалении приложения все сохранённые в нём данные удаляются с устройства. Вы самостоятельно отвечаете за распечатки, PDF-файлы и файлы резервных копий.'],
      s1: ['Даты и пробеги хранятся только на вашем устройстве. Кнопкой «Добавить в календарь» приложение после вашего разрешения добавляет событие с напоминанием в календарь. Другие записи календаря приложение не читает. Без разрешения вы можете вместо этого сохранить или отправить файл календаря (.ics). Для записей в календаре действуют его правила конфиденциальности.'],
      loc: {title: 'Местоположение', paragraphs: ['Только когда вы нажимаете кнопку расстояния, приложение запрашивает разрешение и использует ваше приблизительное местоположение. Расстояние до офиса в Дортмунде вычисляется на вашем устройстве. Местоположение не сохраняется и не передаётся в OJ Gutachter или третьим лицам.']},
      s5: 'Это приложение помогает при покупке подержанного автомобиля. Чтобы сообщить о повреждении после ДТП, используйте отдельный OJ Schadenmelder на OJ-Website.'
    }
  };
  Object.keys(T).forEach(lang => {
    const target = OJ_TRANSLATIONS[lang];
    const t = T[lang];
    if (!target || !Array.isArray(target.legalSections) || target.legalSections.length < 6) return;
    const sections = target.legalSections.map(section => ({title: section.title, paragraphs: section.paragraphs.slice()}));
    sections[0].paragraphs = t.s0.slice();
    sections[1].paragraphs = t.s1.slice();
    sections[5].paragraphs = [t.s5];
    sections.splice(3, 0, t.loc);
    target.legalSections = sections;
    target.legalEyebrow = t.eyebrow;
  });
})();
