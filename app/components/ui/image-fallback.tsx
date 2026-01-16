'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends ImageProps {
    fallbackSrc?: string;
    fallbackText?: string;
}

export default function ImageWithFallback({
    src,
    alt,
    fallbackSrc,
    fallbackText = 'No Image',
    className,
    ...props
}: ImageWithFallbackProps) {
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
        setError(false);
    }, [src]);

    return (
        <>
            {!error ? (
                <Image
                    {...props}
                    src={imgSrc}
                    alt={alt}
                    className={className}
                    onError={() => {
                        if (fallbackSrc) {
                            setImgSrc(fallbackSrc);
                        } else {
                            setError(true);
                        }
                    }}
                />
            ) : (
                <div className={`flex flex-col items-center justify-center bg-slate-800 text-gray-500 ${className}`}>
                    <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
                    <span className="text-xs font-medium opacity-50">{fallbackText}</span>
                </div>
            )}
        </>
    );
}
