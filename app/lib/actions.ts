'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function authenticateGoogle() {
    await signIn('google', { redirectTo: '/' });
}

export async function createAccount(
    prevState: string | undefined,
    formData: FormData,
) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!email || !password || !name) {
        return 'Missing required fields';
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return 'Email already in use.';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const roleEnum = role === 'LANDLORD' ? 'LANDLORD' : 'TENANT';

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: roleEnum,
            },
        });
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error('Registration failed:', (error as any).message);
        return 'Failed to create account.';
    }

    // Redirect to login or auto-login
    redirect('/login?registered=true');
}

/**
 * LANDLORD ACTIONS
 */

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function createListing(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'LANDLORD') {
        return { message: 'Unauthorized: Access denied.' };
    }

    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const area = parseFloat(formData.get('area') as string);
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const district = formData.get('district') as string;
    const type = formData.get('type') as string;
    const ownerName = formData.get('ownerName') as string;
    const ownerPhone = formData.get('ownerPhone') as string;

    // Handle Image Upload
    // Randomize default image using verified mock retail images
    const validMockImages = ['img_1.jpg', 'img_5.jpg', 'img_7.jpg', 'img_9.jpg', 'img_10.jpg', 'img_11.jpg', 'img_13.jpg'];
    const randomImage = validMockImages[Math.floor(Math.random() * validMockImages.length)];
    let imageUrl = `/mock/retail/${randomImage}`;

    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filename = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
            const uploadDir = path.join(process.cwd(), 'public/uploads');

            await writeFile(path.join(uploadDir, filename), buffer);
            imageUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error('Error uploading file:', error);
            // Fallback to text input if upload fails or was not provided properly
            const urlInput = formData.get('imageUrl') as string;
            if (urlInput) imageUrl = urlInput;
        }
    } else {
        const urlInput = formData.get('imageUrl') as string;
        if (urlInput) imageUrl = urlInput;
    }

    if (!title || !price || !area || !district) {
        return { message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' };
    }

    try {
        await prisma.listing.create({
            data: {
                title,
                name: title,
                description: `Cho thuê ${type} tại ${district}`,
                price,
                area,
                address,
                city: city || 'Hồ Chí Minh',
                district,
                type: type || 'retail',
                images: [imageUrl],
                landlordId: session.user.id,
                ownerName: ownerName || session.user.name,
                ownerPhone,
                // Defaults
                frontage: 0,
                floors: 1,
            },
        });

        revalidatePath('/search');
        revalidatePath('/landlord');
    } catch (error) {
        console.error('Create listing error:', error);
        return { message: 'Lỗi khi tạo tin đăng.' };
    }

    redirect('/landlord');
}

export async function updateListing(
    id: string,
    prevState: any,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'LANDLORD') {
        return { message: 'Unauthorized: Access denied.' };
    }

    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const area = parseFloat(formData.get('area') as string);
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const district = formData.get('district') as string;
    const type = formData.get('type') as string;
    const ownerName = formData.get('ownerName') as string;
    const ownerPhone = formData.get('ownerPhone') as string;

    // Check ownership
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing || existing.landlordId !== session.user.id) {
        return { message: 'Not found or forbidden' };
    }

    // Handle Image Upload
    let imageUrl = existing.images[0];
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filename = Date.now() + '_' + imageFile.name.replace(/\s/g, '_');
            const uploadDir = path.join(process.cwd(), 'public/uploads');

            await writeFile(path.join(uploadDir, filename), buffer);
            imageUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }

    try {
        await prisma.listing.update({
            where: { id },
            data: {
                title,
                name: title,
                description: `Cho thuê ${type} tại ${district}`,
                price,
                area,
                address,
                city: city || 'Hồ Chí Minh',
                district,
                type: type || 'retail',
                images: [imageUrl],
                ownerName,
                ownerPhone,
            },
        });
        revalidatePath('/search');
        revalidatePath('/landlord');
        revalidatePath(`/listing/${id}`);
    } catch (error) {
        console.error('Update listing error:', error);
        return { message: 'Lỗi khi cập nhật tin đăng.' };
    }

    redirect('/landlord');
}

export async function deleteListing(id: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'LANDLORD') {
        return { message: 'Unauthorized' };
    }

    try {
        await prisma.listing.delete({
            where: { id },
        });
        revalidatePath('/search');
        revalidatePath('/landlord');
        return { message: 'Success' };
    } catch (error) {
        return { message: 'Failed to delete' };
    }
}

/**
 * REVIEW ACTIONS
 */
export async function submitReview(listingId: string, rating: number, comment: string) {
    const session = await auth();
    if (!session?.user) {
        return { message: 'Vui lòng đăng nhập để đánh giá.' };
    }

    // Optional: Check if user is TENANT (or allow anyone)
    // if (session.user.role !== 'TENANT') ...

    if (!rating || !comment) {
        return { message: 'Vui lòng nhập đủ thông tin.' };
    }

    try {
        await prisma.review.create({
            data: {
                rating,
                comment,
                userId: session.user.id,
                listingId,
            },
        });
        revalidatePath(`/listing/${listingId}`);
        return { message: 'Success' };
    } catch (error) {
        console.error('Review error:', error);
        return { message: 'Lỗi khi gửi đánh giá.' };
    }
}

/**
 * SEARCH ACTION
 */
export async function searchListings(filters: {
    province?: string;
    district?: string;
    type?: string;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    limit?: number;
}) {
    // Construct Where Clause
    const where: any = {};

    if (filters.province) {
        // Search in both city and province fields to be safe, or just province if confident
        where.OR = [
            { city: { contains: filters.province, mode: 'insensitive' } },
            { province: { contains: filters.province, mode: 'insensitive' } }
        ];
    }

    // If district is selected, it refines the location
    if (filters.district) {
        where.district = { contains: filters.district, mode: 'insensitive' };
    }

    if (filters.type) {
        where.type = filters.type;
    }

    if (filters.maxPrice) {
        where.price = { lte: filters.maxPrice };
    }

    if (filters.minArea || filters.maxArea) {
        where.area = {};
        if (filters.minArea) where.area.gte = filters.minArea;
        if (filters.maxArea) where.area.lte = filters.maxArea;
    }

    try {
        const results = await prisma.listing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: filters.limit || 100,
        });

        // Map to Frontend Interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return results.map((item: any) => ({
            ...item,
            // Ensure compat with API interface
            name: item.name || item.title || 'Mặt bằng',
            lat: item.lat || 0,
            lon: item.lon || 0,
            ai: {
                suggestedPrice: item.ai_suggestedPrice || 0,
                potentialScore: item.ai_potentialScore || 50,
                riskLevel: item.ai_riskLevel || 'medium',
                priceLabel: item.ai_priceLabel || 'fair'
            },
            owner: item.ownerName ? {
                name: item.ownerName,
                phone: item.ownerPhone || ''
            } : undefined
        }));
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}
