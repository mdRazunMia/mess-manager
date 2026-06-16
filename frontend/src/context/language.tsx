'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const bnMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const enMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface LanguageContextType {
  lang: 'en' | 'bn';
  toggleLang: () => void;
  t: (key: string) => string;
  monthName: (month: number) => string;
}

const labels: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    members: 'Members',
    meals: 'Meals',
    expenses: 'Expenses',
    payments: 'Payments',
    reports: 'Reports',
    invoices: 'Invoices',
    email: 'Email',
    settings: 'Settings',
    totalMembers: 'Total Members',
    totalExpenses: 'Total Expenses',
    currentMealRate: 'Current Meal Rate',
    currentMonthMeals: 'Current Month Meals',
    totalCollections: 'Total Collections',
    pendingDues: 'Pending Dues',
    monthlyExpenses: 'Monthly Expenses',
    mealConsumption: 'Meal Consumption',
    collectionTrend: 'Collection Trend',
    addMember: 'Add Member',
    name: 'Name',
    phone: 'Phone',
    room: 'Room Number',
    joinDate: 'Joining Date',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    mealManagement: 'Meal Management',
    dailyMealEntry: 'Daily Meal Entry',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    addExpense: 'Add Expense',
    category: 'Category',
    amount: 'Amount',
    description: 'Description',
    date: 'Date',
    paidBy: 'Paid By',
    recordPayment: 'Record Payment',
    method: 'Method',
    reference: 'Reference / Transaction ID',
    cash: 'Cash',
    bkash: 'bKash',
    nagad: 'Nagad',
    bank: 'Bank Transfer',
    monthlyReports: 'Monthly Reports',
    generateSettlement: 'Generate Settlement',
    mealSummary: 'Meal Summary',
    totalBreakfast: 'Total Breakfast',
    totalLunch: 'Total Lunch',
    totalDinner: 'Total Dinner',
    weightedMeals: 'Weighted Meals',
    memberSettlements: 'Member Settlements',
    mealRate: 'Meal Rate',
    mealCost: 'Meal Cost',
    utility: 'Utility',
    totalDue: 'Total Due',
    generateInvoices: 'Generate Invoices',
    downloadPDF: 'Download PDF',
    sentAt: 'Sent At',
    emailSystem: 'Email System',
    sendEmails: 'Send emails to members',
    composeEmail: 'Compose Email',
    template: 'Template',
    customMessage: 'Custom Message',
    monthlyBill: 'Monthly Bill',
    paymentReminder: 'Payment Reminder',
    subject: 'Subject',
    message: 'Message',
    recipients: 'Recipients',
    sendToAll: 'Send to all members',
    sendEmail: 'Send Email',
    configureMess: 'Configure your mess and system preferences',
    general: 'General',
    mealSettings: 'Meal Settings',
    emailConfig: 'Email',
    automation: 'Automation',
    messInfo: 'Mess Information',
    messName: 'Mess Name',
    address: 'Address',
    managerName: 'Manager Name',
    managerEmail: 'Manager Email',
    currency: 'Currency',
    mealWeightSettings: 'Meal Weight Settings',
    breakfastWeight: 'Breakfast Weight',
    lunchWeight: 'Lunch Weight',
    dinnerWeight: 'Dinner Weight',
    smtpConfig: 'SMTP Configuration',
    smtpHost: 'SMTP Host',
    smtpPort: 'SMTP Port',
    smtpUsername: 'SMTP Username',
    smtpPassword: 'SMTP Password',
    senderEmail: 'Sender Email',
    testSMTP: 'Test SMTP Connection',
    automationSettings: 'Automation Settings',
    autoSettlement: 'Automatic Settlement',
    autoSettlementDesc: 'Generate monthly settlements automatically on the last day of each month',
    autoEmails: 'Automatic Emails',
    autoEmailsDesc: 'Send invoices via email automatically after settlement generation',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    members: 'সদস্য',
    meals: 'খাবার',
    expenses: 'খরচ',
    payments: 'পেমেন্ট',
    reports: 'রিপোর্ট',
    invoices: 'ইনভয়েস',
    email: 'ইমেইল',
    settings: 'সেটিংস',
    totalMembers: 'মোট সদস্য',
    totalExpenses: 'মোট খরচ',
    currentMealRate: 'বর্তমান খাবারের হার',
    currentMonthMeals: 'বর্তমান মাসের খাবার',
    totalCollections: 'মোট আদায়',
    pendingDues: 'বকেয়া',
    monthlyExpenses: 'মাসিক খরচ',
    mealConsumption: 'খাবার গ্রহণ',
    collectionTrend: 'আদায়ের প্রবণতা',
    addMember: 'সদস্য যোগ করুন',
    name: 'নাম',
    phone: 'ফোন',
    room: 'রুম নম্বর',
    joinDate: 'যোগদানের তারিখ',
    status: 'অবস্থা',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    mealManagement: 'খাবার ব্যবস্থাপনা',
    dailyMealEntry: 'দৈনিক খাবার এন্ট্রি',
    breakfast: 'নাস্তা',
    lunch: 'দুপুরের খাবার',
    dinner: 'রাতের খাবার',
    addExpense: 'খরচ যোগ করুন',
    category: 'ক্যাটাগরি',
    amount: 'পরিমাণ',
    description: 'বিবরণ',
    date: 'তারিখ',
    paidBy: 'প্রদানকারী',
    recordPayment: 'পেমেন্ট রেকর্ড করুন',
    method: 'পদ্ধতি',
    reference: 'রেফারেন্স / ট্রানজেকশন আইডি',
    cash: 'নগদ',
    bkash: 'বিকাশ',
    nagad: 'নগদ',
    bank: 'ব্যাংক ট্রান্সফার',
    monthlyReports: 'মাসিক রিপোর্ট',
    generateSettlement: 'সেটেলমেন্ট তৈরি করুন',
    mealSummary: 'খাবার সারাংশ',
    totalBreakfast: 'মোট নাস্তা',
    totalLunch: 'মোট দুপুরের খাবার',
    totalDinner: 'মোট রাতের খাবার',
    weightedMeals: 'ওজনযুক্ত খাবার',
    memberSettlements: 'সদস্য সেটেলমেন্ট',
    mealRate: 'খাবারের হার',
    mealCost: 'খাবারের খরচ',
    utility: 'ইউটিলিটি',
    totalDue: 'মোট বকেয়া',
    generateInvoices: 'ইনভয়েস তৈরি করুন',
    downloadPDF: 'PDF ডাউনলোড করুন',
    sentAt: 'পাঠানোর সময়',
    emailSystem: 'ইমেইল সিস্টেম',
    sendEmails: 'সদস্যদের ইমেইল পাঠান',
    composeEmail: 'ইমেইল লিখুন',
    template: 'টেমপ্লেট',
    customMessage: 'কাস্টম মেসেজ',
    monthlyBill: 'মাসিক বিল',
    paymentReminder: 'পেমেন্ট অনুস্মারক',
    subject: 'বিষয়',
    message: 'মেসেজ',
    recipients: 'প্রাপকদের',
    sendToAll: 'সব সদস্যদের পাঠান',
    sendEmail: 'ইমেইল পাঠান',
    configureMess: 'আপনার মেস এবং সিস্টেমের পছন্দসমূহ কনফিগার করুন',
    general: 'সাধারণ',
    mealSettings: 'খাবার সেটিংস',
    emailConfig: 'ইমেইল',
    automation: 'অটোমেশন',
    messInfo: 'মেস তথ্য',
    messName: 'মেসের নাম',
    address: 'ঠিকানা',
    managerName: 'ম্যানেজারের নাম',
    managerEmail: 'ম্যানেজারের ইমেইল',
    currency: 'মুদ্রা',
    mealWeightSettings: 'খাবারের ওজন সেটিংস',
    breakfastWeight: 'নাস্তার ওজন',
    lunchWeight: 'দুপুরের খাবারের ওজন',
    dinnerWeight: 'রাতের খাবারের ওজন',
    smtpConfig: 'SMTP কনফিগারেশন',
    smtpHost: 'SMTP হোস্ট',
    smtpPort: 'SMTP পোর্ট',
    smtpUsername: 'SMTP ইউজারনেম',
    smtpPassword: 'SMTP পাসওয়ার্ড',
    senderEmail: 'প্রেরকের ইমেইল',
    testSMTP: 'SMTP সংযোগ পরীক্ষা করুন',
    automationSettings: 'অটোমেশন সেটিংস',
    autoSettlement: 'স্বয়ংক্রিয় সেটেলমেন্ট',
    autoSettlementDesc: 'প্রতি মাসের শেষ দিনে স্বয়ংক্রিয়ভাবে মাসিক সেটেলমেন্ট তৈরি করুন',
    autoEmails: 'স্বয়ংক্রিয় ইমেইল',
    autoEmailsDesc: 'সেটেলমেন্ট তৈরির পর স্বয়ংক্রিয়ভাবে ইনভয়েস ইমেইল পাঠান',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key: string) => key,
  monthName: (month: number) => enMonths[month - 1],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'bn' : 'en'));
  }, []);

  const t = useCallback(
    (key: string) => {
      return labels[lang][key] || key;
    },
    [lang]
  );

  const monthName = useCallback(
    (month: number) => {
      return lang === 'bn' ? bnMonths[month - 1] : enMonths[month - 1];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, monthName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
