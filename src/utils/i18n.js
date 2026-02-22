const SUPPORTED_LANGUAGES = ['bg', 'en'];
const DEFAULT_LANGUAGE = 'bg';
const STORAGE_KEY = 'app_language';

const translations = {
  bg: {
    'app.name': 'Freelancer Report',
    'nav.dashboard': 'Табло',
    'nav.companies': 'Компании',
    'nav.activities': 'Дейности',
    'nav.workEntry': 'Отработени часове',
    'nav.reports': 'Отчети',
    'nav.profile': 'Профил',
    'nav.adminDashboard': 'Админ табло',
    'nav.users': 'Потребители',
    'nav.login': 'Вход',
    'nav.register': 'Регистрация',
    'nav.logout': 'Изход',
    'nav.userDefault': 'Потребител',
    'nav.userMenu.profile': 'Профил',
    'nav.language.label': 'Език',
    'nav.language.bg': 'Български',
    'nav.language.en': 'English',
    'nav.toggle': 'Покажи/скрий навигацията',
    'lang.code': 'bg',

    'title.home': 'Начало',
    'title.login': 'Вход',
    'title.register': 'Регистрация',
    'title.dashboard': 'Табло',
    'title.companies': 'Компании',
    'title.activities': 'Дейности',
    'title.workEntry': 'Отработени часове',
    'title.reports': 'Отчети',
    'title.profile': 'Профил',
    'title.adminDashboard': 'Админ табло',
    'title.adminUsers': 'Потребители',

    'home.heading': 'Freelancer Report',
    'home.subtitle': 'Предна част на приложението.',

    'login.heading': 'Вход',
    'login.noAccount': 'Нямате профил?',

    'register.heading': 'Регистрация',
    'register.haveAccount': 'Вече имате профил?',

    'dashboard.heading': 'Табло',
    'dashboard.welcome': 'Добре дошли',
    'dashboard.welcomeUser': 'Добре дошли, {{name}}',
    'dashboard.card.companies': 'Компании',
    'dashboard.card.activities': 'Дейности',
    'dashboard.card.workEntry': 'Отработени часове',
    'dashboard.card.reports': 'Отчети',
    'dashboard.action.manageCompanies': 'Управление на компании',
    'dashboard.action.manageActivities': 'Управление на дейности',
    'dashboard.action.enterHours': 'Въведи часове',
    'dashboard.action.generateReport': 'Генерирай отчет',

    'companies.heading': 'Компании',
    'companies.list': 'Списък с компании',
    'companies.modal.title': 'Детайли за компания',
    'companies.modal.newTitle': 'Нова компания',
    'companies.modal.editTitle': 'Редакция на компания',

    'activities.heading': 'Дейности',
    'activities.list': 'Списък с дейности',
    'activities.modal.title': 'Детайли за дейност',
    'activities.modal.newTitle': 'Нова дейност',
    'activities.modal.editTitle': 'Редакция на дейност',

    'adminDashboard.heading': 'Админ табло',
    'adminDashboard.tools': 'Административни инструменти',
    'adminDashboard.userManagement': 'Управление на потребители',
    'adminDashboard.workEntry': 'Отработени часове',

    'adminUsers.heading': 'Управление на потребители',
    'adminUsers.helper.prefix': 'Създаването на потребители от браузъра не е възможно без сървърния Admin API. Използвайте',
    'adminUsers.helper.suffix': 'за да създадете фрийлансъри, след което променете ролята им тук.',
    'adminUsers.usersCard': 'Потребители',
    'adminUsers.editCard': 'Редакция на потребител',

    'profile.heading': 'Профил',

    'reports.heading': 'Отчети',
    'reports.config': 'Настройки на отчета',
    'reports.generate': 'Генериране на PDF',
    'reports.help': 'Изисква запазена конфигурация и въведени часове за избрания месец.',

    'workEntry.heading': 'Отработени часове',

    'labels.email': 'Имейл',
    'labels.password': 'Парола',
    'labels.fullName': 'Име и фамилия',
    'labels.companyName': 'Име на компания',
    'labels.taxNumber': 'Данъчен номер',
    'labels.city': 'Град',
    'labels.activityName': 'Име на дейност',
    'labels.hourlyRate': 'Почасова ставка (EUR)',
    'labels.company': 'Компания',
    'labels.template': 'Шаблон',
    'labels.location': 'Локация',
    'labels.introText': 'Уводен текст',
    'labels.outroText': 'Заключителен текст',
    'labels.reportMonth': 'Месец на отчета',
    'labels.reportDate': 'Дата на отчета',
    'labels.month': 'Месец',
    'labels.year': 'Година',
    'labels.day': 'Ден',
    'labels.activity': 'Дейност',
    'labels.ratePerHour': 'Ставка/час (EUR)',
    'labels.hours': 'Часове',
    'labels.totalAmount': 'Обща сума',
    'labels.totalHours': 'Общо часове',
    'labels.equivalentDays': 'Еквивалентни дни (8 ч/ден)',
    'labels.role': 'Роля',
    'labels.userId': 'ID на потребителя',

    'actions.login': 'Вход',
    'actions.register': 'Регистрация',
    'actions.createAccount': 'Създай профил',
    'actions.save': 'Запази',
    'actions.cancel': 'Отказ',
    'actions.search': 'Търси',
    'actions.clear': 'Изчисти',
    'actions.new': 'Нов',
    'actions.edit': 'Редакция',
    'actions.delete': 'Изтрий',
    'actions.download': 'Изтегли',
    'actions.saveDownload': 'Запази и изтегли',
    'actions.saveConfig': 'Запази настройките',

    'placeholders.searchByName': 'Търси по име',
    'placeholders.selectCompany': 'Избери компания...',
    'placeholders.selectTemplate': 'Избери шаблон...',

    'table.name': 'Име',
    'table.taxNumber': 'Данъчен номер',
    'table.city': 'Град',
    'table.actions': 'Действия',
    'table.fullName': 'Име и фамилия',
    'table.role': 'Роля',
    'table.noData': 'Няма данни',
    'table.noCompanies': 'Няма компании',
    'table.noActivities': 'Няма дейности',
    'table.noUsers': 'Няма потребители',

    'options.role.freelancer': 'фрийлансър',
    'options.role.admin': 'админ',

    'userSelector.label': 'Работа от името на:',
    'userSelector.loading': 'Зареждане на потребители...',
    'userSelector.allUsers': 'Всички потребители',
    'userSelector.selectUser': 'Избери потребител...',
    'userSelector.error': 'Грешка при зареждане на потребители',

    'messages.loggedIn': 'Успешен вход',
    'messages.loginFailed': 'Неуспешен вход',
    'messages.accountCreated': 'Профилът е създаден',
    'messages.registrationFailed': 'Неуспешна регистрация',
    'messages.companyCreated': 'Компанията е създадена',
    'messages.companyUpdated': 'Компанията е обновена',
    'messages.companyDeleted': 'Компанията е изтрита',
    'messages.companySaveFailed': 'Грешка при запис на компания',
    'messages.companyLoadFailed': 'Грешка при зареждане на компании',
    'messages.companyDeleteFailed': 'Грешка при изтриване на компания',
    'messages.activityCreated': 'Дейността е създадена',
    'messages.activityUpdated': 'Дейността е обновена',
    'messages.activityDeleted': 'Дейността е изтрита',
    'messages.activitySaveFailed': 'Грешка при запис на дейност',
    'messages.activityLoadFailed': 'Грешка при зареждане на дейности',
    'messages.activityDeleteFailed': 'Грешка при изтриване на дейност',
    'messages.userDeleted': 'Профилът е изтрит',
    'messages.userDeleteFailed': 'Грешка при изтриване на потребител',
    'messages.userUpdated': 'Профилът е обновен',
    'messages.userUpdateFailed': 'Грешка при обновяване на потребител',
    'messages.userSelectToEdit': 'Изберете потребител за редакция',
    'messages.usersLoadFailed': 'Грешка при зареждане на потребители',
    'messages.profileUpdated': 'Профилът е обновен',
    'messages.profileUpdateFailed': 'Грешка при обновяване на профил',
    'messages.profileLoadFailed': 'Грешка при зареждане на профил',
    'messages.workEntriesSaved': 'Записите са запазени',
    'messages.workEntriesSaveFailed': 'Грешка при запис на часове',
    'messages.workEntriesLoadFailed': 'Грешка при зареждане на записи',
    'messages.workEntriesSelectCompanyMonth': 'Изберете компания и месец',
    'messages.workEntriesLoadLookupsFailed': 'Грешка при зареждане на компании/дейности',
    'messages.reportConfigSaved': 'Конфигурацията е запазена',
    'messages.reportConfigSaveFailed': 'Грешка при запазване на конфигурацията',
    'messages.reportConfigLoadFailed': 'Грешка при зареждане на конфигурацията',
    'messages.reportGenerateFailed': 'Грешка при генериране на отчет',
    'messages.reportSaved': 'Отчетът е запазен',
    'messages.reportSelectCompanyTemplate': 'Изберете компания и шаблон',
    'messages.reportSelectCompanyMonthDate': 'Изберете компания, месец и дата на отчета',
    'messages.reportsLoadLookupsFailed': 'Грешка при зареждане на компании/шаблони',
    'messages.logoutFailed': 'Грешка при изход',
    'messages.actionFailed': 'Операцията е неуспешна',

    'confirm.deleteCompany': 'Да изтрия тази компания?',
    'confirm.deleteActivity': 'Да изтрия тази дейност?',
    'confirm.deleteUserProfile': 'Да изтрия този профил? (Auth потребителят остава)',

    'aria.close': 'Затвори',
  },
  en: {
    'app.name': 'Freelancer Report',
    'nav.dashboard': 'Dashboard',
    'nav.companies': 'Companies',
    'nav.activities': 'Activities',
    'nav.workEntry': 'Work Entry',
    'nav.reports': 'Reports',
    'nav.profile': 'Profile',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.users': 'Users',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.userDefault': 'User',
    'nav.userMenu.profile': 'Profile',
    'nav.language.label': 'Language',
    'nav.language.bg': 'Bulgarian',
    'nav.language.en': 'English',
    'nav.toggle': 'Toggle navigation',
    'lang.code': 'en',

    'title.home': 'Home',
    'title.login': 'Login',
    'title.register': 'Register',
    'title.dashboard': 'Dashboard',
    'title.companies': 'Companies',
    'title.activities': 'Activities',
    'title.workEntry': 'Work Entry',
    'title.reports': 'Reports',
    'title.profile': 'Profile',
    'title.adminDashboard': 'Admin Dashboard',
    'title.adminUsers': 'Admin Users',

    'home.heading': 'Freelancer Report',
    'home.subtitle': 'Front-end scaffold.',

    'login.heading': 'Login',
    'login.noAccount': 'No account?',

    'register.heading': 'Register',
    'register.haveAccount': 'Already have an account?',

    'dashboard.heading': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.welcomeUser': 'Welcome, {{name}}',
    'dashboard.card.companies': 'Companies',
    'dashboard.card.activities': 'Activities',
    'dashboard.card.workEntry': 'Work Entry',
    'dashboard.card.reports': 'Reports',
    'dashboard.action.manageCompanies': 'Manage companies',
    'dashboard.action.manageActivities': 'Manage activities',
    'dashboard.action.enterHours': 'Enter hours',
    'dashboard.action.generateReport': 'Generate report',

    'companies.heading': 'Companies',
    'companies.list': 'Company list',
    'companies.modal.title': 'Company details',
    'companies.modal.newTitle': 'New company',
    'companies.modal.editTitle': 'Edit company',

    'activities.heading': 'Activities',
    'activities.list': 'Activity list',
    'activities.modal.title': 'Activity details',
    'activities.modal.newTitle': 'New activity',
    'activities.modal.editTitle': 'Edit activity',

    'adminDashboard.heading': 'Admin Dashboard',
    'adminDashboard.tools': 'Admin tools',
    'adminDashboard.userManagement': 'User management',
    'adminDashboard.workEntry': 'Work Entry',

    'adminUsers.heading': 'User management',
    'adminUsers.helper.prefix': 'Creating users from the browser isn’t supported without server-side Admin API. Use',
    'adminUsers.helper.suffix': 'to create freelancer users, then edit role here.',
    'adminUsers.usersCard': 'Users',
    'adminUsers.editCard': 'Edit user',

    'profile.heading': 'Profile',

    'reports.heading': 'Reports',
    'reports.config': 'Report configuration',
    'reports.generate': 'Generate PDF',
    'reports.help': 'Requires saved configuration and existing work entries for the selected month.',

    'workEntry.heading': 'Work Entry',

    'labels.email': 'Email',
    'labels.password': 'Password',
    'labels.fullName': 'Full name',
    'labels.companyName': 'Company Name',
    'labels.taxNumber': 'Tax Identification Number',
    'labels.city': 'City',
    'labels.activityName': 'Activity Name',
    'labels.hourlyRate': 'Hourly Rate (EUR)',
    'labels.company': 'Company',
    'labels.template': 'Template',
    'labels.location': 'Location',
    'labels.introText': 'Intro text',
    'labels.outroText': 'Concluding text',
    'labels.reportMonth': 'Report month',
    'labels.reportDate': 'Report date',
    'labels.month': 'Month',
    'labels.year': 'Year',
    'labels.day': 'Day',
    'labels.activity': 'Activity',
    'labels.ratePerHour': 'Rate/Hour (EUR)',
    'labels.hours': 'Hours',
    'labels.totalAmount': 'Total Amount',
    'labels.totalHours': 'Total Hours',
    'labels.equivalentDays': 'Equivalent Days (8h/day)',
    'labels.role': 'Role',
    'labels.userId': 'User ID',

    'actions.login': 'Login',
    'actions.register': 'Register',
    'actions.createAccount': 'Create account',
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.search': 'Search',
    'actions.clear': 'Clear',
    'actions.new': 'New',
    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.download': 'Download',
    'actions.saveDownload': 'Save & Download',
    'actions.saveConfig': 'Save config',

    'placeholders.searchByName': 'Search by name',
    'placeholders.selectCompany': 'Select company...',
    'placeholders.selectTemplate': 'Select template...',

    'table.name': 'Name',
    'table.taxNumber': 'Tax #',
    'table.city': 'City',
    'table.actions': 'Actions',
    'table.fullName': 'Full name',
    'table.role': 'Role',
    'table.noData': 'No data',
    'table.noCompanies': 'No companies yet',
    'table.noActivities': 'No activities yet',
    'table.noUsers': 'No users',

    'options.role.freelancer': 'freelancer',
    'options.role.admin': 'admin',

    'userSelector.label': 'Acting on behalf of:',
    'userSelector.loading': 'Loading users...',
    'userSelector.allUsers': 'All Users',
    'userSelector.selectUser': 'Select a user...',
    'userSelector.error': 'Error loading users',

    'messages.loggedIn': 'Logged in',
    'messages.loginFailed': 'Login failed',
    'messages.accountCreated': 'Account created',
    'messages.registrationFailed': 'Registration failed',
    'messages.companyCreated': 'Company created',
    'messages.companyUpdated': 'Company updated',
    'messages.companyDeleted': 'Company deleted',
    'messages.companySaveFailed': 'Failed to save company',
    'messages.companyLoadFailed': 'Failed to load companies',
    'messages.companyDeleteFailed': 'Failed to delete company',
    'messages.activityCreated': 'Activity created',
    'messages.activityUpdated': 'Activity updated',
    'messages.activityDeleted': 'Activity deleted',
    'messages.activitySaveFailed': 'Failed to save activity',
    'messages.activityLoadFailed': 'Failed to load activities',
    'messages.activityDeleteFailed': 'Failed to delete activity',
    'messages.userDeleted': 'User profile deleted',
    'messages.userDeleteFailed': 'Failed to delete user',
    'messages.userUpdated': 'User updated',
    'messages.userUpdateFailed': 'Failed to update user',
    'messages.userSelectToEdit': 'Select a user to edit',
    'messages.usersLoadFailed': 'Failed to load users',
    'messages.profileUpdated': 'Profile updated',
    'messages.profileUpdateFailed': 'Failed to update profile',
    'messages.profileLoadFailed': 'Failed to load profile',
    'messages.workEntriesSaved': 'Work entries saved',
    'messages.workEntriesSaveFailed': 'Failed to save work entries',
    'messages.workEntriesLoadFailed': 'Failed to load work entries',
    'messages.workEntriesSelectCompanyMonth': 'Select company and month',
    'messages.workEntriesLoadLookupsFailed': 'Failed to load companies/activities',
    'messages.reportConfigSaved': 'Report configuration saved',
    'messages.reportConfigSaveFailed': 'Failed to save configuration',
    'messages.reportConfigLoadFailed': 'Failed to load report config',
    'messages.reportGenerateFailed': 'Failed to generate report',
    'messages.reportSaved': 'Report saved',
    'messages.reportSelectCompanyTemplate': 'Select company and template',
    'messages.reportSelectCompanyMonthDate': 'Select company, month, and report date',
    'messages.reportsLoadLookupsFailed': 'Failed to load companies/templates',
    'messages.logoutFailed': 'Logout failed',
    'messages.actionFailed': 'Action failed',

    'confirm.deleteCompany': 'Delete this company?',
    'confirm.deleteActivity': 'Delete this activity?',
    'confirm.deleteUserProfile': 'Delete this profile? (Auth user will remain)',

    'aria.close': 'Close',
  }
};

function normalizeLanguage(lang) {
  if (SUPPORTED_LANGUAGES.includes(lang)) return lang;
  return DEFAULT_LANGUAGE;
}

export function getLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return normalizeLanguage(stored || DEFAULT_LANGUAGE);
}

export function getLocale() {
  return getLanguage() === 'bg' ? 'bg-BG' : 'en-US';
}

export function t(key, params = {}) {
  const lang = getLanguage();
  const dict = translations[lang] || translations[DEFAULT_LANGUAGE] || {};
  const fallback = translations[DEFAULT_LANGUAGE] || {};
  let value = dict[key] || fallback[key] || key;

  Object.entries(params).forEach(([paramKey, paramValue]) => {
    value = value.replaceAll(`{{${paramKey}}}`, String(paramValue));
  });

  return value;
}

function setDocumentLanguage(lang) {
  const normalized = normalizeLanguage(lang);
  if (document?.documentElement) {
    document.documentElement.lang = normalized;
  }
  return normalized;
}

export function applyTranslations(root = document) {
  const scope = root || document;
  if (!scope) return;

  const elements = scope.querySelectorAll('[data-i18n], [data-i18n-attr], [data-i18n-html]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }

    const htmlKey = el.getAttribute('data-i18n-html');
    if (htmlKey) {
      el.innerHTML = t(htmlKey);
    }

    const attrSpec = el.getAttribute('data-i18n-attr');
    if (attrSpec) {
      attrSpec.split('|').forEach((pair) => {
        const [attrName, attrKey] = pair.split(':');
        if (!attrName || !attrKey) return;
        el.setAttribute(attrName.trim(), t(attrKey.trim()));
      });
    }
  });

  const titleKey = document?.body?.getAttribute('data-i18n-title');
  if (titleKey) {
    document.title = t(titleKey);
  }
}

export function setLanguage(lang) {
  const normalized = normalizeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, normalized);
  setDocumentLanguage(normalized);
  applyTranslations(document);
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: normalized } }));
}

export function initI18n() {
  const lang = getLanguage();
  setDocumentLanguage(lang);
  applyTranslations(document);
  return lang;
}
