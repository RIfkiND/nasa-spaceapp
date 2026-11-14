import {
  ArrowRight,
  Play,
  Satellite,
  Layers,
  Calendar,
  Mountain,
  Droplets,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';
import type { Language } from '../../types/landing';

interface HeroSectionProps {
  currentLang: Language;
  onOpenWorkspace: () => void;
  onScrollToDemo: () => void;
}

  export function HeroSection({
    currentLang,
    onOpenWorkspace,
    onScrollToDemo,
}: HeroSectionProps) {
  const isId = currentLang === 'id';

  return (
      <section id="hero" className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
        {/* Background Graphic / Subtle Satellite Grid & Aerial Farm Aesthetic */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#E3F1F3]/40 via-[#F4F7FA] to-[#F4F7FA]" />

        {/* Geospatial grid pattern */}
        <div
          className="absolute inset-0 -z-10 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#237F8E 0.75px, transparent 0.75px), radial-gradient(#237F8E 0.75px, #F4F7FA 0.75px)`,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px'
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Main Hero Header */}
          <div className="mx-auto max-w-3xl text-center">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#237F8E]/25 bg-white px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#237F8E] uppercase shadow-xs mb-4">
                <span className="flex h-2 w-2 rounded-full bg-[#6BA544] animate-pulse" />
                <span>✓ {isId ? 'DECISION-SUPPORT ROTASI TANAMAN' : 'CROP ROTATION DECISION SUPPORT'}</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#14232B] sm:text-5xl lg:text-[52px] lg:leading-[1.15]">
                {isId ? (
                  <>
                    Pilih rotasi tanaman dengan <br className="hidden sm:inline" />
                    <span className="text-[#237F8E]">bukti dari satelit NASA</span>
                  </>
                ) : (
                  <>
                    Plan crop rotations with <br className="hidden sm:inline" />
                    <span className="text-[#237F8E]">NASA satellite evidence</span>
                  </>
                )}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-[#5F6B74] leading-relaxed max-w-2xl mx-auto">
                {isId ? (
                  <>
                    Dinilai sesuai risiko iklim musim depan, dan <strong>jujur soal di mana datanya belum cukup</strong>. Membantu petani dan penyuluh membandingkan trade-off secara ilmiah, bukan mendikte satu pilihan.
                  </>
                ) : (
                  <>
                    Evaluated under projected seasonal climate risks, and <strong>transparent where observational data is limited</strong>. Helping farmers and extension workers explore trade-offs, not dictating fixed dogma.
                  </>
                )}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onOpenWorkspace}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] px-7 py-3 text-sm font-bold text-white shadow-md transition hover:from-[#1B6572] hover:to-[#17463c] hover:shadow-lg active:scale-95"
                >
                  <span>{isId ? 'Mulai Bandingkan' : 'Start Comparing Rotations'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={onScrollToDemo}
                  className="flex items-center gap-2 rounded-full border border-[#E6EBF0] bg-white px-6 py-3 text-sm font-semibold text-[#14232B] shadow-xs transition hover:border-[#237F8E] hover:text-[#237F8E] hover:bg-[#F7F9FB] active:scale-95"
                >
                  <Play className="h-4 w-4 text-[#237F8E] fill-[#237F8E]/20" />
                  <span>{isId ? 'Lihat Simulasi Live' : 'Live Interactive Demo'}</span>
                </button>
              </div>

              {/* Pilot Study Verification Badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#5F6B74]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Satellite className="h-3.5 w-3.5 text-[#237F8E]" />
                    <span>{isId ? 'Pilot Wilayah: Banyumas, Jawa Tengah' : 'Pilot Study: Banyumas Basin, Central Java'}</span>
                  </span>
                  <span className="hidden sm:inline">&middot;</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#6BA544]" />
                      <span>{isId ? 'HLS 30m & ECOSTRESS 70m Asimilasi' : 'HLS 30m & ECOSTRESS 70m Assimilation'}</span>
                    </span>
                  </div>
              </div>

              {/* 3 FLOATING BENTO CARDS (Verifiable data from Product Brief) */}
              <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Field Profile */}
                <div className="relative rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
                    <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                      ✓ {isId ? 'PROFIL LAHAN' : 'FIELD PROFILE'}
                    </span>
                    <span className="rounded-full bg-[#E3F1F3] px-2.5 py-0.5 text-[10px] font-bold text-[#1B6572]">
                      {isId ? '4 Lapisan Data' : '4 Data Tiers'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[#14232B]">
                    {isId ? 'Kondisi Biofisik Multi-Sensor' : 'Multi-Sensor Biophysical State'}
                  </h3>
                  <p className="mt-1 text-xs text-[#5F6B74] leading-relaxed">
                    {isId
                      ? 'Karakteristik spesifik petak lahan yang direkonstruksi dari observasi satelit NASA.'
                      : 'Plot-level biophysical characteristics reconstructed directly from NASA satellites.'}
                  </p>

                  <ul className="mt-4 space-y-2.5 text-xs text-[#14232B]">
                    <li className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E]">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="font-semibold">{isId ? 'Iklim 20+ Tahun' : '20+ Year Daily Climate'}</strong>
                        <span className="block text-[11px] text-[#5F6B74]">{isId ? 'NASA POWER & GPM IMERG harian' : 'NASA POWER & GPM IMERG daily'}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E]">
                        <Droplets className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="font-semibold">{isId ? 'Kelembapan Tanah Root-Zone' : 'Root-Zone Soil Moisture'}</strong>
                        <span className="block text-[11px] text-[#5F6B74]">{isId ? 'SMAP L4 (0–100 cm) konteks DAS 9 km' : 'SMAP L4 (0–100 cm) 9km basin context'}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E]">
                        <Mountain className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="font-semibold">{isId ? 'Lereng & Risiko Erosi' : 'Slope & Soil Erosion'}</strong>
                        <span className="block text-[11px] text-[#5F6B74]">{isId ? 'NASA SRTM 30m topografi terasering' : 'NASA SRTM 30m terrace topography'}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E]">
                        <Layers className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="font-semibold">{isId ? 'Deteksi Periode Bera' : 'Fallow Window Detection'}</strong>
                        <span className="block text-[11px] text-[#5F6B74]">{isId ? 'Kurva fenologi NDVI HLS 30m (2018–2024)' : 'HLS 30m NDVI phenology (2018–2024)'}</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Card 2: Average vs Worst-Case Year (CVaR) */}
                <div className="relative rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
                    <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                      ✓ {isId ? 'RISIKO CVAR' : 'CVAR RISK PROFILE'}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                      <TrendingDown className="h-3 w-3" />
                      {isId ? 'Tahun Ekstrem' : 'Extreme Year'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[#14232B]">
                    {isId ? 'Rata-rata vs. Tahun Terburuk' : 'Average vs. Worst-Case Year'}
                  </h3>
                  <p className="mt-1 text-xs text-[#5F6B74] leading-relaxed">
                    {isId
                      ? 'Pola eksisting terlihat bagus pada tahun rata-rata, tetapi hancur saat El Niño kering ekstrem tiba.'
                      : 'Existing rotation looks fine on average, but crashes severely during extreme El Niño drought years.'}
                  </p>

                  {/* Visual Comparison Bars */}
                  <div className="mt-5 space-y-4">
                    {/* Baseline Padi-Padi-Bera */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[#14232B] mb-1">
                        <span>{isId ? 'Padi-Padi-Bera (Eksisting)' : 'Paddy–Paddy–Fallow (Baseline)'}</span>
                        <span className="text-[#B4443A] font-bold tabular-nums">{isId ? 'Anjlok -58%' : 'Drops -58%'}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#5F6B74] w-16">{isId ? 'Rata-rata:' : 'Average:'}</span>
                          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#237F8E] h-full rounded-full" style={{ width: '65%' }} />
                          </div>
                          <span className="text-[11px] tabular-nums font-semibold w-7 text-right">65</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#B4443A] font-bold w-16">{isId ? 'El Niño:' : 'El Niño:'}</span>
                          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#B4443A] h-full rounded-full" style={{ width: '24%' }} />
                          </div>
                          <span className="text-[11px] tabular-nums font-bold text-[#B4443A] w-7 text-right">24</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Rotation */}
                    <div className="pt-2 border-t border-[#E6EBF0]">
                      <div className="flex justify-between text-xs font-semibold text-[#14232B] mb-1">
                        <span className="text-[#1E5B4F] font-bold">{isId ? 'Padi-Padi-Kacang Hijau (Vima-1)' : 'Paddy–Paddy–Mungbean (Vima-1)'}</span>
                        <span className="text-[#2E7D4F] font-bold tabular-nums">{isId ? 'Stabil +86%' : 'Stable +86%'}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#5F6B74] w-16">{isId ? 'Rata-rata:' : 'Average:'}</span>
                          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#6BA544] h-full rounded-full" style={{ width: '86%' }} />
                          </div>
                          <span className="text-[11px] tabular-nums font-semibold w-7 text-right">86</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#2E7D4F] font-bold w-16">{isId ? 'El Niño:' : 'El Niño:'}</span>
                          <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-[#2E7D4F] h-full rounded-full" style={{ width: '74%' }} />
                          </div>
                          <span className="text-[11px] tabular-nums font-bold text-[#2E7D4F] w-7 text-right">74</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#5F6B74] bg-[#F7F9FB] p-2 rounded-xl border border-[#E6EBF0]">
                    <Info className="h-3.5 w-3.5 text-[#237F8E] shrink-0" />
                    <span>{isId ? 'Penilaian risiko teruji pada fase analog 2015 & 2023.' : 'Risk tested against 2015 & 2023 analog drought years.'}</span>
                  </div>
                </div>

                {/* Card 3: Verifiable Data Metrics */}
                <div className="relative rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
                    <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                      ✓ {isId ? 'JEJAK DATA' : 'DATA PROVENANCE'}
                    </span>
                    <span className="rounded-full bg-[#E3F1F3] px-2.5 py-0.5 text-[10px] font-bold text-[#1B6572]">
                      {isId ? 'Terverifikasi' : 'Audited'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[#14232B]">
                    {isId ? 'Angka Berbasis Data Nyata' : 'Strictly Verifiable Metrics'}
                  </h3>
                  <p className="mt-1 text-xs text-[#5F6B74] leading-relaxed">
                    {isId
                      ? 'Kami tidak menyajikan klaim marketing kosong. Semua angka terikat pada dataset ilmiah.'
                : 'No fabricated marketing hype. Every metric maps directly to peer-reviewed datasets.'}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
                      <span className="block text-2xl font-bold text-[#237F8E] tabular-nums">3+</span>
                      <span className="text-[11px] font-semibold text-[#14232B]">
                        {isId ? 'Strategi Dibandingkan' : 'Rotations Evaluated'}
                      </span>
                      <span className="block text-[10px] text-[#5F6B74] mt-0.5">
                        {isId ? 'Pareto Frontier optimal' : 'Pareto trade-off front'}
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
                      <span className="block text-2xl font-bold text-[#237F8E] tabular-nums">20+</span>
                      <span className="text-[11px] font-semibold text-[#14232B]">
                        {isId ? 'Tahun Iklim Historis' : 'Years Daily Climate'}
                      </span>
                      <span className="block text-[10px] text-[#5F6B74] mt-0.5">
                        {isId ? '2000–2025 NASA POWER' : '2000–2025 POWER & GPM'}
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
                      <span className="block text-xl font-bold text-[#237F8E] tabular-nums">2015–25</span>
                      <span className="text-[11px] font-semibold text-[#14232B]">
                        {isId ? 'Observasi Satelit' : 'Satellite Records'}
                      </span>
                      <span className="block text-[10px] text-[#5F6B74] mt-0.5">
                        {isId ? 'HLS 30m & ECOSTRESS' : 'HLS 30m & ECOSTRESS'}
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3">
                      <span className="block text-2xl font-bold text-[#237F8E] tabular-nums">26</span>
                      <span className="text-[11px] font-semibold text-[#14232B]">
                        {isId ? 'Sumber Data Ditinjau' : 'Datasets Audited'}
                      </span>
                      <span className="block text-[10px] text-[#5F6B74] mt-0.5">
                        {isId ? 'Status transparansi' : 'Full open audit'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          );
}
          export default HeroSection;
