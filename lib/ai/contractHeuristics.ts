export interface ContractRisk {
    title: string;
    risk: 'High' | 'Medium' | 'Low';
    desc: string;
    advice: string;
}

export const analyzeContractRisks = (text: string): ContractRisk[] => {
    const risks: ContractRisk[] = [];
    const lowerText = text.toLowerCase().replace(/\s+/g, ' '); // Normalize spaces

    // 1. Rủi ro Tăng giá (Price Adjustments)
    // Detects: "tăng giá", "điều chỉnh giá" combined with infinite terms or high percentages
    if (lowerText.match(/tăng giá|điều chỉnh giá|thay đổi giá/)) {
        if (lowerText.match(/không giới hạn|tùy ý|do bên a quyết định|theo giá thị trường/)) {
            risks.push({
                title: '🚨 Rủi ro Tăng giá "Thả Nổi"',
                risk: 'High',
                desc: 'Điều khoản cho phép tăng giá không giới hạn hoặc "theo giá thị trường" mà không có mức trần (Cap).',
                advice: 'Bắt buộc thêm: "Tăng không quá 10%/năm" hoặc cố định giá trong 2-3 năm đầu.'
            });
        } else if (lowerText.match(/(\d{2})%|(\d)\s?lần/)) {
            // Check for high percentage (>15%)
            const match = lowerText.match(/(\d{1,3})%/);
            if (match && parseInt(match[1]) > 15) {
                risks.push({
                    title: '⚠️ Mức tăng giá quá cao',
                    risk: 'Medium',
                    desc: `Phát hiện mức tăng giá ${match[0]}, cao hơn mức lạm phát trung bình (4-5%).`,
                    advice: 'Thương lượng giảm biên độ tăng giá xuống < 10%.'
                });
            }
        }
    }

    // 2. Bẫy Tiền Cọc (Deposit Forfeiture)
    // Detects: "mất cọc", "không hoàn lại" contextually linked to minor issues
    if (lowerText.includes('cọc') || lowerText.includes('đặt cọc')) {
        if (lowerText.match(/chấm dứt|hủy bỏ|đơn phương/)) {
            if (lowerText.match(/mất toàn bộ|không hoàn lại|bồi thường gấp đôi/)) {
                risks.push({
                    title: '💀 Điều khoản Phạt Cọc Nghiêm ngặt',
                    risk: 'High',
                    desc: 'Phát hiện rủi ro mất trắng cọc nếu chấm dứt hợp đồng sớm, kể cả lý do khách quan.',
                    advice: 'Thêm điều khoản: "Hoàn cọc nếu chấm dứt do Bất khả kháng" hoặc báo trước 30 ngày.'
                });
            }
        }
        // Specific trap: Minor damages
        if (lowerText.match(/xước|hư hỏng nhỏ|vết bẩn/)) {
            risks.push({
                title: '⚠️ Bẫy Cọc "Lỗi Nhỏ"',
                risk: 'High',
                desc: 'Có thể bị trừ cọc vì các lỗi hao mòn tự nhiên (xước sơn, vết bẩn).',
                advice: 'Ghi rõ: "Không phạt hao mòn tự nhiên (wear and tear)."'
            });
        }
    }

    // 3. Quyền Đơn Phương Chấm Dứt (Termination)
    if (lowerText.match(/lấy lại nhà|đơn phương chấm dứt|thu hồi mặt bằng/)) {
        if (lowerText.match(/bất cứ lúc nào|không cần báo trước|báo trước \d+ ngày/)) {
            risks.push({
                title: '🚫 Chủ nhà hủy HĐ tùy ý',
                risk: 'High',
                desc: 'Chủ nhà có quyền lấy lại nhà với thông báo ngắn hạn. Rất rủi ro cho vốn đầu tư.',
                advice: 'Yêu cầu: Nếu Bên A đơn phương chấm dứt, phải đền bù 100% cọc + chi phí khấu hao tài sản.'
            });
        }
    }

    // 4. Chi Phí Ẩn (Hidden Costs)
    if (!lowerText.includes('đã bao gồm') && (lowerText.includes('phí quản lý') || lowerText.includes('phí dịch vụ') || lowerText.includes('phí vệ sinh'))) {
        risks.push({
            title: '💸 Chi Phí Ẩn Chưa Rõ Ràng',
            risk: 'Medium',
            desc: 'Phát hiện các khoản phí phụ (Quản lý, vệ sinh, bảo vệ) chưa rõ ai chịu.',
            advice: 'Liệt kê cụ thể các loại phí trong Phụ lục để tránh tranh cãi sau này.'
        });
    }

    // 5. Sửa Chữa & Kết Cấu (Repairs)
    if (lowerText.includes('sửa chữa') && lowerText.includes('bên b') && (lowerText.includes('tất cả') || lowerText.includes('toàn bộ'))) {
        risks.push({
            title: '🛠️ Trách nhiệm Sửa chữa Bất công',
            risk: 'Medium',
            desc: 'Yêu cầu bên thuê chịu mọi chi phí sửa chữa là không công bằng với hư hỏng kết cấu.',
            advice: 'Phân loại rõ: Hư hỏng nhỏ (<1tr) -> Bên thuê. Kết cấu/lớn -> Bên cho thuê.'
        });
    }

    // 6. Hạn Chế Sang Nhượng (Subleasing)
    if (lowerText.includes('không được sang nhượng') || (lowerText.includes('sang nhượng') && lowerText.includes('sự đồng ý'))) {
        risks.push({
            title: '🔒 Hạn chế Sang nhượng/Cho thuê lại',
            risk: 'Medium',
            desc: 'Khó khăn khi muốn rút vốn hoặc chia sẻ mặt bằng kinh doanh.',
            advice: 'Đàm phán: "Được phép sang nhượng khi báo trước 30 ngày và đối tác đủ năng lực TC."'
        });
    }

    return risks;
};
