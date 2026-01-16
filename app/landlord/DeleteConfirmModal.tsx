'use client';

import { X } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa</h3>
                    <p className="text-gray-400">
                        Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác và bài đăng sẽ bị xóa vĩnh viễn khỏi hệ thống.
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                    >
                        {isDeleting ? 'Đang xóa...' : 'Xóa bài đăng'}
                    </button>
                </div>
            </div>
        </div>
    );
}
