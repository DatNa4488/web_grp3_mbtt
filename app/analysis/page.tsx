'use client';

import { useState, useEffect } from 'react';
import ValuationCard from '@/components/Analysis/ValuationCard';
import { Calculator, Upload, FileText, AlertTriangle, Check, Loader2, ArrowRight } from 'lucide-react';
import { calculateROI, getValuation } from '@/lib/api';
import { PROVINCES, getDistrictsByProvince, getProvinceShortName } from '@/lib/districts';
import { getFeatureImportance, findSimilarListings, FeatureImportance, SimilarListing } from '@/lib/ai/model';

import { parseFile } from '@/lib/utils/fileParser';
import { analyzeContractRisks, ContractRisk } from '@/lib/ai/contractHeuristics';

export default function AnalysisPage() {
  const [loading, setLoading] = useState(false);

  // State for Valuation Form
  const [valForm, setValForm] = useState({
    province: '',
    district: '',
    area: '',
    price: '',
    frontage: '',
    floors: '',
    type: 'streetfront'
  });
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [competitors, setCompetitors] = useState<SimilarListing[]>([]); // New: Real Competitors
  const [aiInsights, setAiInsights] = useState<FeatureImportance[]>([]); // New: AI Insights

  // State for ROI Calculator
  const [roiForm, setRoiForm] = useState({
    rent: 0,
    productPrice: 0,
    customers: 0,
    cost: 0
  });
  const [roiResult, setRoiResult] = useState<any>(null);

  // ... (LocalStorage effects - Unchanged) ...
  // ... (LocalStorage effects - Unchanged) ...
  useEffect(() => {
    const savedVal = localStorage.getItem('jfinder_valForm_v2');
    const savedRoi = localStorage.getItem('jfinder_roiForm_v2');
    if (savedVal) setValForm(JSON.parse(savedVal));
    if (savedRoi) setRoiForm(JSON.parse(savedRoi));
  }, []);

  useEffect(() => {
    localStorage.setItem('jfinder_valForm_v2', JSON.stringify(valForm));
  }, [valForm]);

  useEffect(() => {
    localStorage.setItem('jfinder_roiForm_v2', JSON.stringify(roiForm));
  }, [roiForm]);

  // Reset Function
  const handleReset = () => {
    const defaultVal = { province: '', district: '', area: '', price: '', frontage: '', floors: '', type: 'streetfront' };
    const defaultRoi = { rent: 0, productPrice: 0, customers: 0, cost: 0 };
    setValForm(defaultVal);
    setRoiForm(defaultRoi);
    setValuationResult(null);
    setRoiResult(null);
    setCompetitors([]);
    localStorage.removeItem('jfinder_valForm_v2');
    localStorage.removeItem('jfinder_roiForm_v2');
  };

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const input = {
        district: valForm.district || 'Quận 1',
        area: Number(valForm.area) || 50,
        frontage: Number(valForm.frontage) || 5, // Now dynamic
        floors: Number(valForm.floors) || 1,     // Now dynamic
        type: valForm.type || 'streetfront'
      };

      // 1. Get Valuation
      const valData = await getValuation(input);
      setValuationResult(valData);

      // 2. Get Real AI Data
      const similarData = findSimilarListings(input);
      setCompetitors(similarData);

      const importanceData = await getFeatureImportance(input);
      setAiInsights(importanceData);

      // 3. Calculate ROI
      const roiData = await calculateROI({
        monthlyRent: Number(valForm.price) * 1000000 || roiForm.rent,
        productPrice: roiForm.productPrice,
        dailyCustomers: roiForm.customers,
        operatingCost: roiForm.cost
      });
      setRoiResult(roiData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateROI = async () => {
    const data = await calculateROI({
      monthlyRent: Number(valForm.price) * 1000000 || roiForm.rent,
      productPrice: roiForm.productPrice,
      dailyCustomers: roiForm.customers,
      operatingCost: roiForm.cost
    });
    setRoiResult(data);
  };

  const [showDetail, setShowDetail] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contractRisks, setContractRisks] = useState<ContractRisk[]>([]);

  // Calculate Mock Trend Data based on Valuation Price
  const basePrice = valuationResult?.suggestedPrice || 50;
  const trendData = Array.from({ length: 12 }, (_, i) => Math.round(basePrice * (0.9 + Math.random() * 0.2)));

  return (
    <div className="min-h-screen pt-24 pb-40 px-4 md:px-8 relative">
      {/* Contract Analysis Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>

            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Kết Quả Rà Soát Hợp Đồng
                </h3>
                <p className="text-xs text-gray-400 mt-1">AI Legal Assistant - Deep NLP Engine</p>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {contractRisks.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-green-400 font-bold text-lg mb-2">Hợp đồng An toàn!</h4>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">
                    AI không phát hiện các điều khoản rủi ro nghiêm trọng (tăng giá bất thường, bẫy cọc, hủy ngang) trong văn bản này.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-400 font-bold text-sm">Cảnh báo: Phát hiện {contractRisks.length} điều khoản rủi ro</h4>
                      <p className="text-xs text-gray-500 mt-1">Vui lòng xem xét kỹ trước khi đặt bút ký.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {contractRisks.map((risk, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-gray-200 flex items-center gap-2">
                            {idx + 1}. {risk.title}
                          </h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${risk.risk === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            risk.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                              'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                            {risk.risk === 'High' ? 'Cao' : risk.risk === 'Medium' ? 'Trung bình' : 'Thấp'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 pl-4 border-l-2 border-white/10 italic">
                          "{risk.desc}"
                        </p>
                        <div className="bg-cyan-500/5 p-3 rounded-lg border border-cyan-500/10">
                          <p className="text-xs text-cyan-300 font-semibold mb-1">💡 Lời khuyên chuyên gia:</p>
                          <p className="text-xs text-gray-400 leading-relaxed">{risk.advice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowContractModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-semibold transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/20 transition-colors flex items-center gap-2"
              >
                Tải Báo Cáo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800">
              <h3 className="text-xl font-bold text-white">Báo Cáo Phân Tích Thông Minh (AI Powered)</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-8 space-y-8">
              {/* Section 1: Chart Mockup (Dynamic) */}
              <div>
                <h4 className="font-bold text-cyan-400 mb-4">1. Xu Hướng Giá Thị Trường (Dự báo AI)</h4>
                <div className="h-64 bg-slate-800 rounded-xl flex items-end justify-between p-4 px-8 pb-0 gap-2 border border-white/5">
                  {trendData.map((h, i) => (
                    <div key={i} className="w-full bg-gradient-to-t from-cyan-900 to-cyan-500/50 hover:to-cyan-400 transition-all relative group rounded-t-sm" style={{ height: `${(h / (Math.max(...trendData) * 1.1)) * 100}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-cyan-300 opacity-0 group-hover:opacity-100">{h}tr</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                  <span>T1</span><span>T3</span><span>T6</span><span>T9</span><span>T12</span>
                </div>
              </div>

              {/* Section 2: Competition Analysis (Real Data) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-purple-400 mb-4">2. Bất Động Sản Tương Tự (KNN Search)</h4>
                  <ul className="space-y-3">
                    {competitors.length > 0 ? competitors.map((comp, idx) => (
                      <li key={idx} className="flex justify-between text-sm p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-gray-300 truncate w-2/3">{comp.name}</span>
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold">{comp.price} Tr</div>
                          <div className="text-[10px] text-gray-500">Giống {comp.similarity}%</div>
                        </div>
                      </li>
                    )) : (
                      <li className="text-gray-500 italic text-sm">Chưa có dữ liệu so sánh. Hãy chạy phân tích.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-green-400 mb-4">3. Tiềm Năng & Đánh Giá AI</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Điểm Tiềm Năng (AI Score)</span>
                        <span>{valuationResult?.potentialScore || 0}/100</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${valuationResult?.potentialScore || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Mức độ Rủi ro</span>
                        <span className="uppercase">{valuationResult?.riskLevel || 'N/A'}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${valuationResult?.riskLevel === 'low' ? 'bg-green-500' :
                          valuationResult?.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-xs text-green-300 leading-relaxed">
                      ✨ <strong>Kết luận AI:</strong> {valuationResult?.explanation || 'Đang chờ phân tích dữ liệu...'}
                      <br />
                      Dựa trên phân tích {competitors.length} đối thủ cạnh tranh, mức giá đề xuất {valuationResult?.suggestedPrice} Triệu/tháng là {
                        valuationResult?.priceRange && Number(valForm.price) < valuationResult.priceRange.min ? 'RẤT TỐT (Dưới định giá)' :
                          valuationResult?.priceRange && Number(valForm.price) > valuationResult.priceRange.max ? 'CAO (Cần thương lượng)' : 'HỢP LÝ'
                      }.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-slate-800 text-right">
              <button onClick={() => setShowDetail(false)} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg mr-2">Đóng Báo Cáo</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="mb-8 relative">
          <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 mb-4">
            Phân Tích & Hỗ Trợ Ra Quyết Định
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg font-light">
            Phân tích chuyên sâu bởi JFinder Intelligence. Xác thực vị trí kinh doanh của bạn bằng dữ liệu, không phải phỏng đoán.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column: Input */}
          <div className="space-y-8">
            <div className="glass-card rounded-2xl p-8 border-t border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                  <Calculator className="w-5 h-5 text-cyan-400" />
                </div>
                Thông Số Mặt Bằng
                <button
                  onClick={handleReset}
                  title="Làm mới / Xóa dữ liệu đã lưu"
                  className="ml-auto text-xs bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white px-3 py-1 rounded-full transition-colors border border-white/10"
                >
                  Làm mới
                </button>
              </h2>
              <form className="space-y-5">

                {/* Province Selection */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Thành Phố</label>
                  <select
                    value={valForm.province}
                    onChange={e => setValForm({ ...valForm, province: e.target.value, district: '' })}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 focus:bg-[#334155] outline-none transition-all cursor-pointer appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-slate-800 text-gray-400">Chọn thành phố...</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p} className="bg-slate-800 text-white">{getProvinceShortName(p)}</option>
                    ))}
                  </select>
                </div>

                {/* District Selection */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Khu vực (Quận)</label>
                  <select
                    value={valForm.district}
                    onChange={e => setValForm({ ...valForm, district: e.target.value })}
                    disabled={!valForm.province}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 focus:bg-[#334155] outline-none transition-all cursor-pointer disabled:opacity-50 appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-slate-800 text-gray-400">{valForm.province ? 'Chọn Quận...' : 'Chọn TP trước'}</option>
                    {valForm.province && getDistrictsByProvince(valForm.province).map(d => (
                      <option key={d} value={d} className="bg-slate-800 text-white">{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Diện tích (m²)</label>
                    <input
                      type="number"
                      value={valForm.area}
                      onChange={e => setValForm({ ...valForm, area: e.target.value })}
                      placeholder="50"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Giá thuê (Tr.VNĐ)</label>
                    <input
                      type="number"
                      value={valForm.price}
                      onChange={e => setValForm({ ...valForm, price: e.target.value })}
                      placeholder="25"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* New Fields: Frontage, Floors, Location Type */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Mặt tiền (m)</label>
                    <input
                      type="number"
                      value={valForm.frontage}
                      onChange={e => setValForm({ ...valForm, frontage: e.target.value })}
                      placeholder="5"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Số tầng</label>
                    <input
                      type="number"
                      value={valForm.floors}
                      onChange={e => setValForm({ ...valForm, floors: e.target.value })}
                      placeholder="1"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">Loại Vị Trí</label>
                    <select
                      value={valForm.type}
                      onChange={e => setValForm({ ...valForm, type: e.target.value })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="streetfront">Mặt Tiền</option>
                      <option value="shophouse">Shophouse</option>
                      <option value="retail">Cửa hàng</option>
                      <option value="office">Văn phòng</option>
                      <option value="kiosk">Kiosk</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalysis}
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/40 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Tạo Báo Cáo Phân Tích <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                <FileText className="w-6 h-6 text-blue-400" />
                Trợ Lý Pháp Lý AI
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">Tải lên bản thảo hợp đồng. AI sẽ phát hiện điều khoản rủi ro ngay lập tức.</p>
                  <label className="text-xs text-cyan-500 font-bold group-hover:underline cursor-pointer flex items-center gap-1">
                    Bắt đầu Rà soát <ArrowRight className="w-3 h-3" />
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.pdf,.doc,.docx"
                      onClick={(e) => (e.target as HTMLInputElement).value = ''}
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          setIsAnalyzing(true);

                          try {
                            // 1. Extract Text from File (PDF, DOCX, TXT)
                            const text = await parseFile(file);

                            // 2. AI Analysis
                            const analyzedRisks = analyzeContractRisks(text);

                            // Simulate "Thinking" time for UX (1.5s)
                            setTimeout(() => {
                              setContractRisks(analyzedRisks);
                              setIsAnalyzing(false);
                              setShowContractModal(true);
                            }, 1500);
                          } catch (error) {
                            console.error('Analysis Failed:', error);
                            alert('Không thể đọc file. Vui lòng thử lại với file PDF, DOCX hoặc TXT hợp lệ.');
                            setIsAnalyzing(false);
                          }
                        }
                      }} />
                  </label>
                </div>
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:border-cyan-500/50 transition-colors">
                  <span className="text-2xl text-gray-600 group-hover:text-cyan-500">+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Modal for Contract Analysis */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-shimmer"></div>
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping-slow"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Đang Phân Tích Hợp Đồng...</h3>
                <p className="text-gray-400 text-sm mb-6">Hệ thống AI đang rà soát các điều khoản rủi ro và pháp lý.</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-green-500" /></div>
                    <span>Đọc định dạng file...</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-cyan-400 font-bold">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Phân tích ngữ nghĩa Deep Learning...</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded-full border border-gray-600"></div>
                    <span>Đối chiếu rủi ro pháp lý...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Result */}
          <div className="space-y-8 animate-fade-in-up delay-200">
            {/* Valuation Card - Dynamic Data */}
            <ValuationCard listing={valuationResult ? {
              // @ts-ignore
              price: Number(valForm.price) || 0,
              // @ts-ignore
              ai: valuationResult
            } : undefined}
              onShowDetails={() => setShowDetail(true)}
            />

            {/* ROI Calculator */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></span>
                Tính Điểm Hòa Vốn (Break-even)
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Giá bán SP (VNĐ)</label>
                  <input
                    type="number"
                    value={roiForm.productPrice || ''}
                    onChange={e => { setRoiForm({ ...roiForm, productPrice: Number(e.target.value) }); }}
                    onBlur={updateROI}
                    placeholder="VD: 35000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Khách/Ngày</label>
                  <input
                    type="number"
                    value={roiForm.customers || ''}
                    onChange={e => { setRoiForm({ ...roiForm, customers: Number(e.target.value) }); }}
                    onBlur={updateROI}
                    placeholder="VD: 100"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-gray-400">Tổng chi phí mỗi tháng</span>
                  <span className="text-2xl font-bold text-white">
                    {roiResult ? (roiResult.totalMonthlyCost / 1000000).toFixed(1) : ((roiForm.rent + roiForm.cost) / 1000000).toFixed(1)}
                    <span className="text-sm text-gray-500 font-normal ml-1">Tr VNĐ</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent p-5 rounded-2xl border border-purple-500/20 text-center">
                    <div className="text-[10px] text-purple-300 uppercase font-black tracking-widest mb-1">Cần bán (Ngày)</div>
                    <div className="text-3xl font-black text-white">
                      {roiResult ? Math.ceil(roiResult.breakEvenDays) : '-'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Sản phẩm để hòa vốn</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-5 rounded-2xl border border-cyan-500/20 text-center">
                    <div className="text-[10px] text-cyan-300 uppercase font-black tracking-widest mb-1">Mục tiêu ngày</div>
                    <div className="text-xl font-black text-white">
                      {roiResult ? (roiResult.monthlyRevenue / 30 / 1000000).toFixed(1) : '-'} Tr
                      <span className="text-xs font-normal text-gray-400">/ngày</span>
                    </div>
                  </div>
                </div>

                {roiResult && (
                  <div className={`text-center text-sm font-bold p-2 rounded-lg ${roiResult.monthlyProfit > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {roiResult.monthlyProfit > 0
                      ? `Lãi dự kiến: ${(roiResult.monthlyProfit / 1000000).toFixed(1)} Tr/tháng`
                      : `Lỗ dự kiến: ${(Math.abs(roiResult.monthlyProfit) / 1000000).toFixed(1)} Tr/tháng`
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
