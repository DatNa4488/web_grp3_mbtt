'use client';

import { useState } from 'react';
import { deleteListing } from '@/app/lib/actions';
import { Trash2, Loader2 } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function DeleteListingButton({ listingId }: { listingId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteListing(listingId);
        } catch (error) {
            console.error('Failed to delete listing:', error);
            alert('Có lỗi xảy ra khi xóa bài đăng.');
        } finally {
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isDeleting}
                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xóa"
            >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>

            <DeleteConfirmModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </>
    );
}
