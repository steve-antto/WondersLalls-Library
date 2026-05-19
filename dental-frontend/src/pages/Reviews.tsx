import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Reviews() {
  const { t } = useTranslation();
  const reviews = [
    { nameKey: 'ramesh_k', dateKey: 'months_ago_2', key: 'review1' },
    { nameKey: 'priya_s', dateKey: 'month_ago_1', key: 'review2' },
    { nameKey: 'arun_m', dateKey: 'weeks_ago_3', key: 'review3' },
    { nameKey: 'sudha_v', dateKey: 'week_ago_1', key: 'review4' },
    { nameKey: 'kumar_r', dateKey: 'days_ago_5', key: 'review5' }
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('what_patients_say')}</h1>
          <div className="flex justify-center items-center gap-2 text-yellow-400 mb-4">
            <Star className="w-8 h-8 fill-current" /><Star className="w-8 h-8 fill-current" /><Star className="w-8 h-8 fill-current" /><Star className="w-8 h-8 fill-current" /><Star className="w-8 h-8 fill-current text-yellow-400/50" />
            <span className="text-2xl font-bold text-gray-900 ml-2">4.8</span>
          </div>
          <p className="text-gray-500">{t('based_on_reviews')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 transition-all duration-300">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-gray-700 text-lg italic mb-6">{t(review.key)}</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl">{t(review.nameKey).charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{t(review.nameKey)}</h4>
                  <p className="text-sm text-gray-500">{t(review.dateKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google Review Call to Action */}
        <div className="mt-20 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto border border-white/5 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-60"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">{t('write_review_title')}</h3>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed font-light">
              {t('write_review_desc')}
            </p>

            <a 
              href="https://www.google.com/maps/search/?api=1&query=Dr.+Binu%27s+Dental+Clinic+Coimbatore" // Directs to the clinic on Google Maps
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 group text-lg"
            >
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
              {t('write_review_btn')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
