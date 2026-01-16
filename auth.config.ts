import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/onboarding', // Redirect here after sign up
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = auth?.user?.role;

            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnLandlord = nextUrl.pathname.startsWith('/landlord');
            const isOnAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

            // 1. Admin Routes: Only ADMIN
            if (isOnAdmin) {
                if (isLoggedIn && userRole === 'ADMIN') return true;
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Redirect unauthorized logged-in users to Home
                return false; // Redirect unauthenticated users to login
            }

            // 2. Landlord Routes: LANDLORD or ADMIN
            if (isOnLandlord) {
                if (isLoggedIn && (userRole === 'LANDLORD' || userRole === 'ADMIN')) return true;
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Redirect unauthorized logged-in users to Home
                return false; // Redirect unauthenticated users to login
            }

            // 3. Auth Routes (Login/Register)
            if (isOnAuthRoute) {
                if (isLoggedIn) {
                    // Redirect everyone to Home so they see the Landing Page first
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }

            // 4. Protected Dashboard Routes (Dashboard & BI)
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/bi-dashboard');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login
            }

            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role || 'USER';
            }
            return token;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
