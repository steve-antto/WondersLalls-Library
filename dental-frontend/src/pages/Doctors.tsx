import { Award, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import binuImg from '../assets/Binu.jpeg';
import lokaswariImg from '../assets/Lokaswari.jpeg';
export default function Doctors() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const doctors = [
    {
      name: t('doc_name'),
      qual: t('doc_qual'),
      bio: t('doc_bio'),
      patients: '200k+',
      years: '29+',
      image: binuImg,
    },
    {
      name: t('doc2_name'),
      qual: t('doc2_qual'),
      bio: t('doc2_bio'),
      patients: '100+',
      years: '8+',
      image: lokaswariImg,
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === doctors.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? doctors.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [doctors.length]); // Add length dependency just to be safe

  return (
    <div className="pt-24 pb-16 min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('meet_specialist')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('meet_specialist_sub')}</p>
        </div>
        
        <div className="relative animate-in fade-in zoom-in duration-700">
          <div className="overflow-hidden rounded-[3rem] shadow-2xl border border-gray-100 glass">
            <div 
              className="flex transition-transform duration-700 ease-in-out" 
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {doctors.map((doc, index) => (
                <div key={index} className="w-full flex-shrink-0 p-10">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative">
                      <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-gray-100">
                         {doc.image ? (
                           <img src={doc.image} alt={doc.name} className="w-full h-full object-cover object-top" />
                         ) : (
                           <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-accent/20 flex flex-col items-center justify-center text-primary">
                              <Stethoscope className="w-24 h-24 mb-4 opacity-50" />
                              <span className="font-bold text-xl opacity-50 text-center px-4">{doc.name}</span>
                           </div>
                         )}
                      </div>
                      <div className="absolute -bottom-6 -right-6 glass px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
                         <Award className="w-8 h-8 text-yellow-500" />
                         <div>
                           <p className="font-bold text-gray-900">{t('rating_label')}</p>
                           <p className="text-sm text-gray-500">{t('google_reviews')}</p>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{doc.name}</h2>
                        <p className="text-xl text-primary font-medium">{doc.qual}</p>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">{doc.bio}</p>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <div className="text-3xl font-bold text-primary mb-1">{doc.patients}</div>
                          <div className="text-sm font-medium text-gray-600">{t('patients_treated')}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <div className="text-3xl font-bold text-primary mb-1">{doc.years}</div>
                          <div className="text-sm font-medium text-gray-600">{t('years_exp')}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm">{t('spec_rootcanal')}</span>
                        <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm">{t('spec_implants')}</span>
                        <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm">{t('spec_laser')}</span>
                        <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm">{t('spec_cosmetic')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={prevSlide}
              className="p-3 rounded-full bg-white shadow-lg text-primary hover:bg-primary hover:text-white transition-all border border-gray-100 hover:scale-110 active:scale-95"
              aria-label="Previous doctor"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-3">
              {doctors.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={nextSlide}
              className="p-3 rounded-full bg-white shadow-lg text-primary hover:bg-primary hover:text-white transition-all border border-gray-100 hover:scale-110 active:scale-95"
              aria-label="Next doctor"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
