import { createContext, useEffect, useState, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Session, User  } from '@supabase/supabase-js'
import {supabase} from '../lib/supabase'

type AuthContextType = {
    session: Session | null;
    user: User | null;
    handleLogin: () => Promise<void>;
    handleLogout: () => Promise<void>;
    loading: boolean;
};

type AuthContextProviderProps = {
    children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
 
export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(false)

    // Check if session already exists on first load
    useEffect(() => {
        const checkSession = async () => {
            const {data: {session}} = await supabase.auth.getSession()

            if(session) {
                setSession(session)
            }
            else {
                const { data, error } = await supabase.auth.signInAnonymously();
                
                if(error) {
                    console.log("Anonymous login failed: ", error.message)
                    return
                }
                setSession(session)
            }
        }

        checkSession()
    

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
        });

        if (error) {
            alert(error.message);
        }

        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setSession(null);
    }

    return (
        <AuthContext.Provider
        value={{
            session,
            user: session?.user ?? null,
            handleLogin,
            handleLogout,
            loading,
        }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("UserAuth must be used within an AuthContextProvider");
    }

    return context;
};