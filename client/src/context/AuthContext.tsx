import { createContext, useEffect, useState, useContext } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextType = {
    session: Session | null;
    user: User | null;
    handleLogin: () => Promise<void>;
    handleLogout: () => Promise<void>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
};

type AuthContextProviderProps = {
    children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getAnonName() {
    return "Anonymous" + Math.floor(Math.random() * 1000)
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Check & set session if session already exists on first load.
    // Else, sign in anonymously
    useEffect(() => {
        let isMounted = true

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    if (!isMounted) return
                    setSession(session)

                    if (session.user.is_anonymous && !session.user.user_metadata.name) {
                        await supabase.auth.updateUser({
                            data: { name: getAnonName() }
                        })
                    }
                } else {
                    const { data, error } = await supabase.auth.signInAnonymously()

                    if (error) {
                        console.log("Anonymous login failed: ", error.message)
                        return
                    }

                    await supabase.auth.updateUser({
                        data: { name: getAnonName() }
                    })

                    if (isMounted) setSession(data.session)
                }
            } catch (error) {
                console.log("Failed to check/create session: ", error)
            } finally {
                // Only clear the initial loading flag once we actually know
                // whether a session exists, instead of immediately after
                // kicking the async check off.
                if (isMounted) setLoading(false)
            }
        }

        checkSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    // LOGIN
    const handleLogin = async () => {
        setLoading(true)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.href,
            },
        })

        if (error) {
            alert(error.message)
        }

        setLoading(false)
    }

    // LOGOUT
    const handleLogout = async () => {
        setLoading(true)

        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.log(error)
                return
            }

            const { error: anonSignInError } = await supabase.auth.signInAnonymously()
            if (anonSignInError) {
                console.log("Anonymous login failed: ", anonSignInError.message)
                return
            }

            await supabase.auth.updateUser({
                data: { name: getAnonName() }
            })
        } finally {
            // Previously, an early `return` on error left `loading` stuck at
            // `true` forever. `finally` guarantees it always resets.
            setLoading(false)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                handleLogin,
                handleLogout,
                setLoading,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error("UserAuth must be used within an AuthContextProvider")
    }

    return context
}